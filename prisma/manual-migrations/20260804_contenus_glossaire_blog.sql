-- ════════════════════════════════════════════════════════════════════════
-- MEP CONTENUS — sessions du 1er au 4 août 2026
--
--   · glossaire  : sources sur 79 termes (session 1)
--   · blog       : 7 articles, 12218 mots FR + traduction arabe relue
--   · maillage   : 11 fiches maladies/symptômes → articles piliers
--   · compte     : rédaction médicale (signature de relecture, sans accès)
--
-- Généré par scripts/export-mep-contenus-sql.ts
--
-- PRÉREQUIS : déployer aussi les 7 fichiers public/blog-covers/post-*.jpg,
-- sinon les couvertures référencées ici renvoient 404.
--
-- HORS PÉRIMÈTRE, volontairement : les silos Outils, clusters de vie,
-- référentiel de prix, remboursement des médicaments et index des villes sont
-- du contenu EN CODE — ils partent avec le déploiement, sans SQL. Les tables
-- posts/questions portaient aussi des écritures de session 1, mais uniquement
-- sur leur compteur de vues (browsing local) : rien à déployer.
--
-- SÛRETÉ : rejouable · COALESCE sur publishedAt/arReviewedAt · views, createdAt
-- et featured jamais touchés · relatedSlugs en append · contrôles avant COMMIT.
-- ════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─── 0. Compte de rédaction (doit précéder les articles) ───
-- Compte de rédaction : identité de SIGNATURE, pas un accès. « isActive » et
-- « emailVerified » à false bloquent la connexion (features/auth/actions.ts),
-- et le mot de passe est le hash d'un secret aléatoire jamais conservé.
INSERT INTO users ("id", "email", "password", "name", "role", "jobTitle", "credentials", "bio", "isActive", "emailVerified", "updatedAt")
VALUES ('cmsegcq7g0000tgnpot4m9p3b', 'redaction@santeaumaroc.com', '$2b$10$0r/XR.SnSOwEcFFVFHxLOeRoqdszzMihFCyAxF70kH4UKhOjD5Jey', 'Relecture médicale SantéauMaroc', 'EDITOR',
        NULL, 'Relecture éditoriale et médicale des contenus publiés sur SantéauMaroc, contre sources institutionnelles (OMS, ANSM, Assurance Maladie, NHS) et recommandations en vigueur.', 'La rédaction médicale de SantéauMaroc vérifie chaque contenu avant publication : exactitude des faits, conformité aux recommandations, sources citées et adaptation au contexte marocain.', false, false, now())
ON CONFLICT (email) DO UPDATE SET
  "name" = EXCLUDED."name", "role" = EXCLUDED."role", "jobTitle" = EXCLUDED."jobTitle",
  "credentials" = EXCLUDED."credentials", "bio" = EXCLUDED."bio", "updatedAt" = now();
-- « password » volontairement absent du DO UPDATE : ne jamais réécrire un secret existant.

-- ─── Garde-fous de contexte ───
DO $$
BEGIN
  IF (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1) IS NULL THEN
    RAISE EXCEPTION 'Aucun utilisateur ADMIN actif : impossible de fixer authorId';
  END IF;
  IF (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com') IS NULL THEN
    RAISE EXCEPTION 'Compte de rédaction redaction@santeaumaroc.com absent : insertion en section 0 échouée';
  END IF;
  IF (SELECT id FROM post_categories WHERE slug = 'symptomes') IS NULL OR (SELECT id FROM post_categories WHERE slug = 'maladies-traitements') IS NULL THEN
    RAISE EXCEPTION 'Catégories blog « symptomes » et/ou « maladies-traitements » absentes';
  END IF;
END $$;

-- ─── 1. Articles (pilier d'abord : les satellites résolvent pillarId par slug) ───

-- mal-de-dents-rage-de-dents-maroc  (pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdar18r00001snpugaechua', 'Mal de dents : comment soulager une rage de dents et quand consulter', 'mal-de-dents-rage-de-dents-maroc', 'Rage de dents : d''où vient la douleur, ce qui la soulage vraiment en attendant le rendez-vous, les erreurs à ne pas commettre, les signes qui imposent les urgences et ce qui se passe chez le dentiste. Un guide complet adapté au Maroc.', '<p>Une rage de dents ne prévient pas. Elle arrive un vendredi soir, empêche de dormir, résiste au comprimé avalé à la hâte — et laisse une seule question en tête : est-ce que ça peut attendre lundi ? Au Maroc, la douleur dentaire fait partie des tout premiers motifs de consultation, et les chiffres expliquent pourquoi : selon l''enquête nationale de santé bucco-dentaire du ministère de la Santé, <strong>92 % des adultes de 35 à 44 ans</strong> sont touchés par la carie, et <strong>27 % n''ont jamais vu de dentiste</strong>.</p>

<p>Ce guide répond à ce que vous cherchez vraiment : ce qui fait mal exactement, ce qui soulage réellement en attendant le rendez-vous, les gestes qui aggravent la situation, les signes qui imposent les urgences le soir même, et ce qui se passe ensuite au fauteuil. Il complète notre fiche courte <a href="/symptomes/mal-de-dents">mal de dents</a>, à lire si vous cherchez une réponse en trente secondes.</p>

<h2>Pourquoi une dent fait-elle mal ?</h2>

<p>Une dent n''est pas un caillou : c''est un organe vivant, construit en trois couches. L''<strong>émail</strong>, en surface, est le tissu le plus dur du corps et ne contient aucun nerf. Sous lui, la <strong>dentine</strong> est traversée de milliers de canalicules microscopiques qui conduisent le froid, le chaud et le sucré. Au centre, la <strong>pulpe</strong> abrite le nerf et les vaisseaux sanguins.</p>

<p>Toute la logique de la douleur dentaire tient dans cette anatomie. Tant que la lésion reste dans l''émail, il n''y a aucun symptôme : c''est la phase silencieuse, celle qui se voit sur une radio, pas dans le miroir. Quand elle atteint la dentine, la dent devient <em>sensible</em> — au froid, au sucré, à l''air frais. Quand elle touche la pulpe, l''inflammation se produit dans une cavité fermée qui ne peut pas gonfler : la pression monte, et la douleur devient <strong>forte, continue, lancinante</strong>. C''est ce que l''on appelle une rage de dents, ou pulpite.</p>

<h3>Les cinq causes les plus fréquentes</h3>

<ul>
<li><strong>La <a href="/maladies/carie-dentaire">carie</a> profonde</strong> — de loin la première cause. Elle progresse pendant des mois sans bruit, puis se manifeste par une sensibilité, puis par une douleur franche.</li>
<li><strong>La pulpite</strong> — le nerf est atteint et enflammé. Douleur spontanée, prolongée, souvent aggravée par la chaleur et par la position allongée.</li>
<li><strong>L''<a href="/blog/abces-dentaire-maroc">abcès dentaire</a></strong> — le nerf est mort, l''infection s''est installée à la racine. La douleur devient pulsatile, la dent semble « plus haute », le moindre contact est intolérable, et la joue ou la gencive peut gonfler.</li>
<li><strong>Les maladies des gencives</strong> — <a href="/maladies/gingivite">gingivite</a> puis <a href="/blog/parodontite-dechaussement-dents-maroc">parodontite</a> : les gencives <a href="/symptomes/saignement-des-gencives">saignent au brossage</a>, se rétractent, les dents deviennent sensibles au collet puis mobiles.</li>
<li><strong>La <a href="/blog/dent-de-sagesse-extraction-maroc">dent de sagesse</a></strong> — quand elle sort mal, la gencive qui la recouvre s''infecte (péricoronarite) : douleur au fond de la mâchoire, difficulté à ouvrir la bouche, parfois ganglion sous le maxillaire.</li>
</ul>

<p>À côté de ces cinq causes, deux situations reviennent souvent en consultation : la <strong>fêlure</strong> d''une dent (douleur brève et vive à la mastication, sans carie visible) et le <a href="/maladies/bruxisme">bruxisme</a>, ce grincement nocturne qui réveille avec des dents sensibles et une mâchoire fatiguée.</p>

<h3>Quand ce n''est pas la dent : les douleurs qui trompent</h3>

<p>Une douleur ressentie dans les dents ne vient pas toujours des dents. Quatre pièges classiques méritent d''être connus, parce qu''ils changent complètement le médecin à consulter :</p>

<ul>
<li><strong>La <a href="/maladies/sinusite">sinusite</a> maxillaire</strong> : plusieurs dents du haut, du même côté, deviennent douloureuses en même temps, avec une aggravation quand on penche la tête en avant et un nez bouché.</li>
<li><strong>La <a href="/maladies/nevralgie-du-trijumeau">névralgie du trijumeau</a></strong> : décharges électriques de quelques secondes, déclenchées par un effleurement, le vent ou le brossage.</li>
<li><strong>L''articulation de la mâchoire</strong> : douleur devant l''oreille, craquements, ouverture limitée, réveil avec les mâchoires serrées.</li>
<li><strong>Le cœur</strong> : rare mais capital. Une douleur de la mâchoire <em>inférieure</em>, déclenchée par l''effort, accompagnée d''un serrement dans la poitrine, d''un essoufflement ou de sueurs, peut être un <a href="/maladies/infarctus-du-myocarde">infarctus</a>. Dans ce cas, on n''appelle pas le dentiste : on appelle le <strong>141 (SAMU) ou le 15</strong>.</li>
</ul>

<h2>Évaluer la gravité en trois questions</h2>

<p>Avant de chercher un remède, situez votre douleur. Ce tableau résume ce que les dentistes évaluent en premier.</p>

<table>
<thead>
<tr><th>Ce que vous ressentez</th><th>Ce que cela évoque</th><th>Délai à respecter</th></tr>
</thead>
<tbody>
<tr><td>Sensibilité brève au froid ou au sucré, qui s''arrête aussitôt</td><td>Dentine exposée, carie débutante, gencive rétractée</td><td>Rendez-vous dans les jours qui viennent</td></tr>
<tr><td>Douleur qui persiste après le stimulus, réveille la nuit, cède mal aux antalgiques</td><td>Pulpite : le nerf est atteint</td><td>Consultation rapide, sous 24 à 48 h</td></tr>
<tr><td>Douleur pulsatile, dent qui ne supporte plus le contact, mauvais goût dans la bouche</td><td>Infection de la racine, abcès en formation</td><td>Le jour même si possible</td></tr>
<tr><td>Gonflement de la joue, du plancher de la bouche ou du cou, fièvre, difficulté à ouvrir la bouche</td><td>Infection qui diffuse dans les tissus</td><td><strong>Urgence : 141 (SAMU) ou le 15</strong></td></tr>
<tr><td>Dent cassée, déplacée ou expulsée après un choc</td><td>Traumatisme dentaire</td><td><strong>Urgence dentaire immédiate</strong></td></tr>
</tbody>
</table>

<p>Une règle simple sert de repère : <strong>une douleur dentaire qui dure plus de deux jours, ou qui revient, ne se règle pas seule</strong>. Elle peut s''interrompre — c''est même fréquent quand le nerf finit par mourir — mais l''infection, elle, continue.</p>

<h2>Que faire tout de suite pour soulager</h2>

<p>Ces gestes visent un objectif précis et limité : passer la nuit, ou tenir jusqu''au rendez-vous. Aucun ne soigne la dent.</p>

<h3>Ce qui soulage vraiment</h3>

<ol>
<li><strong>Un antalgique simple</strong>, aux doses habituelles indiquées sur la notice. Le <a href="/blog/paracetamol-maroc">paracétamol</a> est le premier choix quand il n''y a pas de contre-indication ; un <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoire</a> comme l''<a href="/blog/ibuprofene-maroc">ibuprofène</a> agit souvent mieux sur une douleur inflammatoire, mais il n''est pas anodin (estomac, reins, grossesse, asthme, traitements en cours) : demandez l''avis de votre pharmacien ou de votre médecin avant de le prendre. Vous pouvez retrouver la fiche des spécialités commercialisées au Maroc, leur prix public et leur taux de remboursement dans notre <a href="/medicaments">base des médicaments</a>.</li>
<li><strong>Un bain de bouche à l''eau salée tiède</strong> — une demi-cuillère à café de sel dans un verre d''eau, à recracher, jamais à avaler. À réserver aux adultes et grands enfants.</li>
<li><strong>Le froid sur la joue</strong>, par-dessus un linge, quinze minutes maximum. Jamais de chaleur sur une joue gonflée : la chaleur favorise la diffusion de l''infection.</li>
<li><strong>Dormir la tête surélevée</strong>, avec un oreiller de plus. La douleur augmente en position allongée parce que l''afflux de sang accroît la pression dans la dent — c''est la vraie raison pour laquelle un mal de dents empire la nuit.</li>
<li><strong>Alléger la mécanique</strong> : aliments mous et tièdes, mastication de l''autre côté, brosse souple, ni très chaud ni très froid.</li>
</ol>

<h3>Les six erreurs qui aggravent la situation</h3>

<blockquote>Attention. Ne posez <strong>jamais</strong> un comprimé d''aspirine ni de l''huile de clou de girofle pure directement sur la gencive : cela provoque une brûlure chimique de la muqueuse, qui s''ajoute à la douleur d''origine.</blockquote>

<ul>
<li><strong>Reprendre un antibiotique d''une ancienne ordonnance.</strong> C''est l''erreur la plus répandue. Elle masque les signes, retarde le soin, favorise la résistance bactérienne, et n''évite pas la récidive. Voir notre article sur le <a href="/blog/antibiotiques-maroc">bon usage des antibiotiques</a>.</li>
<li><strong>Percer ou presser un abcès.</strong> Le drainage est un acte médical, réalisé sous anesthésie.</li>
<li><strong>Appliquer de la chaleur</strong> sur un gonflement.</li>
<li><strong>Passer du fil dentaire autour de la dent douloureuse</strong> si la gencive est enflammée : nettoyez le reste de la bouche, épargnez la zone.</li>
<li><strong>Fumer</strong> — cigarette ou chicha : le tabac entretient l''inflammation gingivale et ralentit la cicatrisation.</li>
<li><strong>Attendre que « ça passe ».</strong> Une douleur qui disparaît sans soin signifie souvent que le nerf est mort, pas que la dent est guérie.</li>
</ul>

<h2>Quand faut-il aller aux urgences ?</h2>

<p>Une infection dentaire négligée peut diffuser dans les tissus du visage et du cou, jusqu''à gêner la respiration. Ces situations ne relèvent pas d''un rendez-vous, mais des urgences immédiates — appelez le <strong>141 (SAMU) ou le 15</strong> :</p>

<ul>
<li>gonflement qui atteint l''œil, le plancher de la bouche ou le cou ;</li>
<li>difficulté à respirer, à avaler ou à parler ;</li>
<li>impossibilité d''ouvrir la bouche normalement ;</li>
<li>fièvre élevée, frissons, altération de l''état général ;</li>
<li>douleur incontrôlable malgré les antalgiques ;</li>
<li>traumatisme avec dent expulsée ou mâchoire douloureuse après un choc.</li>
</ul>

<p>La vigilance doit être renforcée en cas de <a href="/blog/diabete-type-2-maroc">diabète</a>, de traitement immunosuppresseur, de valvulopathie ou de prothèse cardiaque : chez ces personnes, une infection dentaire se complique plus vite et plus fort.</p>

<h2>Ce qui se passe chez le dentiste</h2>

<p>Comprendre le déroulé enlève une bonne part de l''appréhension — et celle-ci est la première cause de retard aux soins.</p>

<p>La consultation commence par un <strong>examen clinique</strong> : inspection, percussion des dents, test au froid pour savoir si le nerf est vivant, palpation des gencives et des ganglions. Une <strong>radiographie</strong> rétro-alvéolaire, ou panoramique si plusieurs dents sont en cause, précise l''étendue de la lésion et l''état de l''os autour de la racine.</p>

<p>Le traitement dépend de ce qui est trouvé :</p>

<ul>
<li><strong>Carie sans atteinte du nerf</strong> — nettoyage puis obturation (composite). Une séance suffit généralement.</li>
<li><strong>Nerf atteint</strong> — <a href="/comment-traiter/carie-dentaire">dévitalisation</a> : le canal est nettoyé, désinfecté, puis obturé. La douleur cède le plus souvent dès cette étape.</li>
<li><strong>Abcès</strong> — <a href="/comment-traiter/abces-dentaire">drainage</a> du pus et traitement du canal. C''est le geste efficace ; l''antibiotique ne vient qu''en complément, dans certaines situations, et <strong>ne remplace jamais le soin de la dent</strong>.</li>
<li><strong>Gencives atteintes</strong> — détartrage, assainissement, parfois surfaçage radiculaire dans les <a href="/comment-traiter/gingivite">parodontites</a>.</li>
<li><strong>Dent non conservable</strong> — extraction, puis discussion d''un remplacement (bridge, prothèse, <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>).</li>
</ul>

<h3>Quel praticien consulter ?</h3>

<p>Dans la très grande majorité des cas, le bon interlocuteur est le <strong><a href="/specialites/chirurgie-dentaire">chirurgien-dentiste</a></strong>. Il traite les caries, les infections, les gencives, extrait et pose les prothèses. Il orientera lui-même vers un <em>parodontologue</em> si les gencives et l''os sont très atteints, vers un <em>orthodontiste</em> pour un problème d''<a href="/symptomes/dents-mal-alignees">alignement</a>, vers un <em>stomatologue</em> ou chirurgien maxillo-facial pour une extraction complexe, et vers un <em>pédodontiste</em> pour les jeunes enfants. Notre page <a href="/quel-medecin-pour/mal-de-dents">quel médecin pour un mal de dents</a> détaille ces situations.</p>

<h3>Combien cela coûte et ce que couvre l''AMO</h3>

<p>Trois éléments font varier la facture : la <strong>nature de l''acte</strong> (un soin de carie et une dévitalisation avec couronne ne se comparent pas), la <strong>ville et le cabinet</strong> — les honoraires sont libres dans le privé — et le <strong>nombre de séances</strong> nécessaires. Le point à retenir sur le plan financier est simple : plus la dent est prise tôt, moins le traitement est lourd et coûteux.</p>

<p>Côté couverture, l''AMO rembourse une partie des soins dentaires sur la base de la tarification nationale de référence, actuellement en cours de révision, et non sur le montant réellement payé : le reste à charge dépend donc de l''écart entre les deux. Demandez toujours un <strong>devis écrit</strong> avant un traitement prothétique ou implantaire, et faites établir une <strong>prise en charge préalable</strong> quand elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux au Maroc</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent les fourchettes observées et la mécanique du remboursement ; notre article sur le <a href="/blog/amo-remboursement-consultation-maroc">remboursement d''une consultation</a> explique les démarches pas à pas.</p>

<h2>Situations particulières</h2>

<h3>Chez l''enfant</h3>

<p>Une douleur dentaire chez l''enfant se traite comme chez l''adulte, avec trois différences : <strong>jamais d''aspirine</strong>, jamais d''huile de clou de girofle sur la gencive, et pas de bain de bouche chez le petit qui pourrait l''avaler. Le paracétamol se dose au poids et non à l''âge : notre article sur le <a href="/blog/paracetamol-maroc">paracétamol</a> donne les repères, et celui sur la <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l''enfant</a> précise quand consulter. Une <a href="/questions/poussees-dentaires-du-bebe-quels-signes-et-comment-le-soulager">poussée dentaire</a> du nourrisson peut gêner et faire baver, mais elle n''explique pas une fièvre élevée ni une diarrhée : dans ce cas, cherchez une autre cause. À voir aussi : notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l''enfant</a>.</p>

<h3>Pendant la grossesse</h3>

<p>Les soins dentaires courants sont possibles et même recommandés pendant la grossesse : les gencives sont plus fragiles à cette période, et une infection non traitée est un risque supérieur à celui du soin. Signalez systématiquement la grossesse : le praticien adapte l''anesthésique, évite certains médicaments et reporte les radiographies non indispensables. Le deuxième trimestre est souvent le plus confortable pour les actes programmés. Voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</p>

<h3>Sous anticoagulant ou antiagrégant</h3>

<p><strong>N''arrêtez jamais votre traitement de vous-même</strong> avant un soin dentaire : le risque lié à l''arrêt est généralement supérieur au risque de saignement. Signalez-le au dentiste, qui prendra les précautions adaptées et, si nécessaire, contactera votre médecin. Notre article sur les <a href="/blog/anticoagulants-maroc">anticoagulants</a> détaille ces précautions.</p>

<h3>Le soir, le week-end ou pendant les fêtes</h3>

<p>Si la douleur est supportable, les gestes décrits plus haut permettent d''attendre l''ouverture des cabinets. Si un signe d''urgence apparaît — gonflement, fièvre, difficulté à avaler ou à respirer — n''attendez pas : rendez-vous aux urgences de l''hôpital le plus proche ou appelez le <strong>141 (SAMU) ou le 15</strong>. Pour le lendemain, vous pouvez <a href="/specialites/chirurgie-dentaire">rechercher un chirurgien-dentiste par ville</a> et réserver un créneau en ligne.</p>

<h2>Éviter la prochaine rage de dents</h2>

<p>C''est la partie la plus rentable de cet article. La quasi-totalité des rages de dents résulte de lésions qui étaient indolores — donc dépistables — pendant des mois.</p>

<ul>
<li><strong>Brossage deux fois par jour, deux minutes</strong>, avec un dentifrice fluoré. C''est la mesure dont l''efficacité est la mieux établie.</li>
<li><strong>Nettoyage entre les dents</strong> une fois par jour : fil ou brossettes. La brosse seule ne nettoie pas les faces où naissent la plupart des caries.</li>
<li><strong>Réduire la fréquence des prises de sucre</strong> plus encore que la quantité. Un thé très sucré siroté toute la matinée est plus délétère qu''une pâtisserie prise en fin de repas : ce sont les attaques acides répétées qui déminéralisent l''émail. Les boissons gazeuses et les jus industriels agissent de même.</li>
<li><strong>Arrêter le tabac et la chicha</strong> — facteur majeur de parodontite et de perte dentaire. Notre article sur le <a href="/blog/arret-tabac-sevrage-maroc">sevrage tabagique</a> peut aider.</li>
<li><strong>Une visite de contrôle une à deux fois par an</strong>, même sans douleur, avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a> selon les besoins. C''est ce qui permet de traiter une carie de l''émail en une séance courte plutôt qu''une pulpite un dimanche soir.</li>
<li><strong>Surveiller les signaux faibles</strong> : <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">dent sensible</a>, <a href="/questions/mes-gencives-saignent-au-brossage-est-ce-une-gingivite-et-que-faire">gencives qui saignent</a>, <a href="/symptomes/mauvaise-haleine">mauvaise haleine</a> persistante, <a href="/questions/je-grince-des-dents-la-nuit-bruxisme-quelles-consequences-et-solutions">grincement nocturne</a>. Ce sont des invitations à consulter, pas des détails.</li>
</ul>

<p>Pour aller plus loin : <a href="/prevenir/carie-dentaire">prévenir la carie dentaire</a>, <a href="/prevenir/gingivite">prévenir les maladies des gencives</a> et notre <a href="/blog/prevention-sante-guide-maroc">guide de la prévention santé</a>.</p>

<h2>En résumé</h2>

<p>Un mal de dents est un signal, pas une maladie en soi. Il indique qu''un tissu de la dent ou de la gencive est atteint, et la seule question utile est de savoir à quelle vitesse il faut agir. Un antalgique et de l''eau salée font passer la nuit ; ils ne referment pas une carie, ne drainent pas un abcès et ne réparent pas une gencive. Devant un gonflement, de la fièvre ou une difficulté à avaler, on ne temporise pas : c''est une urgence. Dans tous les autres cas, une consultation rapide transforme un traitement lourd en soin simple.</p>

<hr>

<p>Une dent qui vous fait souffrir ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement. En présence d''un signe d''urgence — gonflement du visage ou du cou, fièvre, difficulté à respirer ou à avaler — appelez immédiatement le 141 (SAMU) ou le 15.</p>', '/blog-covers/post-mal-de-dents-rage-de-dents-maroc.jpg', 'Chirurgien-dentiste soignant une patiente au fauteuil', (SELECT id FROM post_categories WHERE slug = 'symptomes'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 13, 'Mal de dents : soulager une rage de dents', 'Mal de dents : causes, ce qui soulage vraiment, erreurs à éviter, signes d''urgence et déroulé des soins chez le dentiste. Guide complet adapté au Maroc.', 'Une rage de dents traduit le plus souvent une carie qui a atteint le nerf : la douleur peut s''arrêter, l''infection continue.
Un antalgique soulage mais ne soigne pas : seul le chirurgien-dentiste traite la cause.
Urgence immédiate (141 SAMU ou 15) si gonflement du visage ou du cou, fièvre, difficulté à respirer, à avaler ou à ouvrir la bouche.
Ne posez jamais d''aspirine ni de clou de girofle à même la gencive, et ne reprenez pas un antibiotique d''une ancienne ordonnance.
Une douleur dentaire qui dure plus de deux jours impose une consultation, même si elle se calme.
Au Maroc, 92 % des adultes de 35-44 ans sont touchés par la carie : le contrôle annuel et le détartrage restent les gestes les plus rentables.', '[{"q":"Comment soulager une rage de dents rapidement ?","a":"Prenez un antalgique simple aux doses de la notice (paracétamol en premier choix, anti-inflammatoire sur avis du pharmacien ou du médecin), faites un bain de bouche à l''eau salée tiède à recracher, appliquez du froid sur la joue à travers un linge, dormez la tête surélevée et mastiquez de l''autre côté. Ces gestes permettent d''attendre le rendez-vous : ils ne soignent pas la dent."},{"q":"Combien de temps dure un mal de dents ?","a":"Une sensibilité passagère au froid peut durer quelques jours. En revanche, une douleur dentaire qui dure plus de deux jours, qui réveille la nuit ou qui revient ne se règle pas seule et impose une consultation. Si elle disparaît brutalement sans soin, cela signifie souvent que le nerf est mort : l''infection, elle, poursuit son évolution."},{"q":"Paracétamol ou ibuprofène pour un mal de dents ?","a":"Le paracétamol est le premier choix car il est le mieux toléré. Un anti-inflammatoire comme l''ibuprofène agit souvent mieux sur une douleur d''origine inflammatoire, mais il est contre-indiqué ou à éviter dans plusieurs situations (ulcère, maladie rénale, grossesse, asthme, certains traitements). Demandez l''avis de votre pharmacien ou de votre médecin, et respectez les doses de la notice."},{"q":"Faut-il des antibiotiques pour un mal de dents ?","a":"Non, pas systématiquement. Le traitement efficace d''une infection dentaire est le geste local réalisé par le dentiste : soin du canal, drainage de l''abcès ou extraction. L''antibiotique n''est prescrit qu''en complément dans certaines situations, et il ne remplace jamais le soin de la dent. Reprendre un antibiotique d''une ancienne ordonnance masque les signes, retarde la prise en charge et favorise la résistance bactérienne."},{"q":"Le clou de girofle est-il efficace contre le mal de dents ?","a":"Son principe actif, l''eugénol, a un effet anesthésique local léger et transitoire. Mais l''huile essentielle pure ou le clou appliqué directement sur la gencive provoque une brûlure chimique de la muqueuse, qui ajoute une douleur à la douleur. Ce n''est ni un traitement ni une alternative à la consultation."},{"q":"Pourquoi le mal de dents est-il plus fort la nuit ?","a":"En position allongée, l''afflux de sang vers la tête augmente la pression dans la pulpe dentaire, déjà enflammée dans une cavité qui ne peut pas se dilater. Le silence et l''absence de distraction accentuent aussi la perception de la douleur. Dormir avec un oreiller supplémentaire aide réellement."},{"q":"Peut-on avoir mal aux dents sans carie visible ?","a":"Oui, et c''est fréquent. Il peut s''agir d''une fêlure, d''une gencive rétractée qui expose le collet, d''une carie sous une ancienne obturation, d''un bruxisme, d''un problème de l''articulation de la mâchoire, d''une sinusite maxillaire ou d''une névralgie du trijumeau. Une radiographie et un examen clinique permettent de trancher."},{"q":"Quand un mal de dents devient-il une urgence ?","a":"Dès qu''apparaissent un gonflement du visage, du plancher de la bouche ou du cou, une fièvre élevée, une difficulté à respirer, à avaler ou à parler, une impossibilité d''ouvrir la bouche, ou une douleur incontrôlable malgré les antalgiques. Il faut alors se rendre aux urgences ou appeler le 141 (SAMU) ou le 15. Une dent expulsée après un choc est également une urgence dentaire."},{"q":"Les soins dentaires sont-ils remboursés au Maroc ?","a":"L''AMO rembourse une partie des soins dentaires, calculée sur la tarification nationale de référence — actuellement en cours de révision — et non sur le montant réellement facturé, les honoraires étant libres dans le privé. Le reste à charge dépend donc de cet écart. Demandez un devis écrit avant tout traitement prothétique ou implantaire, et une prise en charge préalable lorsqu''elle est exigée."}]', '[{"label":"Santé bucco-dentaire — principaux repères","url":"https://www.who.int/fr/news-room/fact-sheets/detail/oral-health","publisher":"Organisation mondiale de la Santé (OMS)","year":"2025"},{"label":"Symptômes et évolution de la carie dentaire","url":"https://www.ameli.fr/assure/sante/themes/carie-dentaire/symptomes-diagnostic","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Le traitement et l''évolution d''un abcès dentaire","url":"https://www.ameli.fr/assure/sante/themes/abces-dentaire/traitement-abces-dentaire","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Prescription des antibiotiques en pratique bucco-dentaire — recommandations","url":"https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf","publisher":"ANSM","year":"2011"},{"label":"Toothache — symptômes, soulagement et signes d''urgence","url":"https://www.nhs.uk/conditions/toothache/","publisher":"National Health Service (NHS)"},{"label":"Enquête nationale de santé bucco-dentaire : prévalence de la carie au Maroc","url":"https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire","publisher":"Ministère de la Santé (via Aujourd''hui le Maroc)","year":"2018"}]', 'Mal de dents', NULL, 'ألم الأسنان: كيف تخفّف ألمًا حادًّا ومتى تستشير', 'ألم أسنان حادّ: من أين يأتي الألم، ما الذي يخفّفه فعلًا في انتظار الموعد، الأخطاء التي يجب تفاديها، العلامات التي تفرض المستعجلات، وما يحدث عند طبيب الأسنان. دليل كامل ملائم للمغرب.', '<p>ألم الأسنان لا يُنذر مسبقًا. يأتي مساء الجمعة، يمنع النوم، يقاوم الحبة التي تُؤخذ على عجل — ويترك سؤالًا واحدًا: هل يمكن أن ينتظر إلى يوم الاثنين؟ في المغرب، يُعدّ ألم الأسنان من أوّل أسباب الاستشارة، والأرقام تفسّر ذلك: حسب المسح الوطني للصحة الفموية لوزارة الصحة، <strong>92 % من البالغين بين 35 و44 سنة</strong> مصابون بالتسوّس، و<strong>27 % لم يزوروا طبيب أسنان قطّ</strong>.</p>

<p>يجيب هذا الدليل عمّا تبحث عنه فعلًا: ما الذي يؤلم بالضبط، ما الذي يخفّف الألم حقًّا في انتظار الموعد، الأخطاء التي تزيد الأمر سوءًا، العلامات التي تفرض التوجّه إلى المستعجلات في الليلة نفسها، وما يحدث بعد ذلك على كرسي الطبيب. وهو يكمّل بطاقتنا المختصرة <a href="/symptomes/mal-de-dents">ألم الأسنان</a>، إن كنت تبحث عن جواب في ثلاثين ثانية.</p>

<h2>لماذا يؤلم السنّ؟</h2>

<p>السنّ ليس حجرًا: إنه عضو حيّ مبنيّ من ثلاث طبقات. <strong>المينا</strong> في السطح، وهي أقسى نسيج في الجسم ولا تحتوي على أي عصب. تحتها <strong>العاج</strong>، مخترَقٌ بآلاف القنيّات الدقيقة التي تنقل البرودة والحرارة والحلاوة. وفي المركز، يحتوي <strong>اللبّ</strong> على العصب والأوعية الدموية.</p>

<p>منطق ألم الأسنان كلّه في هذا التشريح. فما دامت الإصابة محصورة في المينا، لا يوجد أي عَرَض: هذه هي المرحلة الصامتة، التي تُرى في الصورة الشعاعية لا في المرآة. وعندما تبلغ العاج، يصبح السنّ <em>حسّاسًا</em> — للبرد، للحلو، للهواء البارد. وعندما تصل إلى اللبّ، يحدث الالتهاب في تجويف مغلق لا يمكنه أن يتوسّع: يرتفع الضغط، ويصبح الألم <strong>قويًّا، متواصلًا، نابضًا</strong>. هذا ما نسمّيه ألم أسنان حادًّا، أو التهاب لبّ السن.</p>

<h3>الأسباب الخمسة الأكثر شيوعًا</h3>

<ul>
<li><strong><a href="/maladies/carie-dentaire">التسوّس</a> العميق</strong> — السبب الأول بفارق كبير. يتقدّم أشهرًا في صمت، ثم يظهر على شكل حساسية، ثم ألم صريح.</li>
<li><strong>التهاب لبّ السن</strong> — العصب مُصاب ومُلتهب. ألم عفويّ، مطوّل، يزداد غالبًا بالحرارة وبالاستلقاء.</li>
<li><strong><a href="/blog/abces-dentaire-maroc">الخُراج السنّي</a></strong> — العصب ميت والعدوى استقرّت في الجذر. يصبح الألم نابضًا، ويبدو السنّ «أعلى» من غيره، وأدنى تلامس لا يُحتمَل، وقد تتورّم الوجنة أو اللثة.</li>
<li><strong>أمراض اللثة</strong> — <a href="/maladies/gingivite">التهاب اللثة</a> ثم <a href="/blog/parodontite-dechaussement-dents-maroc">التهاب دواعم السن</a>: <a href="/symptomes/saignement-des-gencives">تنزف اللثة عند التفريش</a>، وتتراجع، وتصبح الأسنان حسّاسة عند العنق ثم متحرّكة.</li>
<li><strong><a href="/blog/dent-de-sagesse-extraction-maroc">ضرس العقل</a></strong> — عندما يبزغ بشكل سيّئ، تلتهب اللثة التي تغطّيه: ألم في عمق الفكّ، صعوبة في فتح الفم، وأحيانًا عقدة لمفية تحت الفكّ.</li>
</ul>

<p>وإلى جانب هذه الأسباب الخمسة، تتكرّر حالتان في العيادة: <strong>تشقّق</strong> السنّ (ألم قصير وحادّ عند المضغ، دون تسوّس ظاهر)، و<a href="/maladies/bruxisme">صريف الأسنان</a>، أي ذلك الجزّ الليلي الذي يُوقظ صاحبه بأسنان حسّاسة وفكّ متعب.</p>

<h3>عندما لا يكون السنّ هو السبب: الآلام المضلّلة</h3>

<p>الألم الذي نشعر به في الأسنان لا يأتي دائمًا من الأسنان. أربعة مطبّات كلاسيكية تستحقّ المعرفة، لأنها تغيّر تمامًا الطبيب الذي يجب استشارته:</p>

<ul>
<li><strong><a href="/maladies/sinusite">التهاب الجيوب</a> الفكّي</strong>: تتألّم عدّة أسنان عُلوية من الجهة نفسها في الوقت نفسه، مع تفاقم عند إمالة الرأس إلى الأمام وانسداد في الأنف.</li>
<li><strong><a href="/maladies/nevralgie-du-trijumeau">ألم العصب مثلّث التوائم</a></strong>: صعقات كهربائية تدوم ثوانٍ، تُحرّضها لمسة خفيفة أو الهواء أو التفريش.</li>
<li><strong>مفصل الفكّ</strong>: ألم أمام الأذن، طقطقة، فتح محدود، واستيقاظ بفكّين مشدودين.</li>
<li><strong>القلب</strong>: نادر لكنه جوهري. ألم في الفكّ <em>السفلي</em>، يُحرّضه المجهود، مصحوبًا بضغط في الصدر أو ضيق نفس أو تعرّق، قد يكون <a href="/maladies/infarctus-du-myocarde">احتشاء عضلة القلب</a>. في هذه الحالة لا نتّصل بطبيب الأسنان: نتّصل بالرقم <strong>141 (SAMU) أو 15</strong>.</li>
</ul>

<h2>تقييم الخطورة في ثلاثة أسئلة</h2>

<p>قبل البحث عن دواء، حدّد موقع ألمك. يلخّص هذا الجدول ما يقيّمه أطباء الأسنان أوّلًا.</p>

<table>
<thead>
<tr><th>ما تشعر به</th><th>ما يشير إليه</th><th>المدّة التي يجب احترامها</th></tr>
</thead>
<tbody>
<tr><td>حساسية قصيرة للبرد أو الحلو، تتوقّف فورًا</td><td>عاج مكشوف، تسوّس مبتدئ، لثة متراجعة</td><td>موعد في الأيام القادمة</td></tr>
<tr><td>ألم يستمرّ بعد المُنبّه، يُوقظ ليلًا، ولا يستجيب جيّدًا للمسكّنات</td><td>التهاب لبّ السن: العصب مُصاب</td><td>استشارة سريعة، خلال 24 إلى 48 ساعة</td></tr>
<tr><td>ألم نابض، سنّ لا يتحمّل التلامس، طعم سيّئ في الفم</td><td>عدوى في الجذر، خُراج في طور التشكّل</td><td>اليوم نفسه إن أمكن</td></tr>
<tr><td>تورّم في الوجنة أو أرضية الفم أو الرقبة، حمّى، صعوبة في فتح الفم</td><td>عدوى منتشرة في الأنسجة</td><td><strong>استعجال: 141 (SAMU) أو 15</strong></td></tr>
<tr><td>سنّ مكسور أو متزحزح أو مقتلع بعد صدمة</td><td>رَضّ سنّي</td><td><strong>استعجال سنّي فوري</strong></td></tr>
</tbody>
</table>

<p>قاعدة بسيطة تصلح كمرجع: <strong>ألم أسنان يدوم أكثر من يومين، أو يعود، لا يُحلّ من تلقاء نفسه</strong>. قد يتوقّف — وهذا شائع حين يموت العصب في النهاية — لكن العدوى تتابع مسارها.</p>

<h2>ما يجب فعله فورًا للتخفيف</h2>

<p>تستهدف هذه الإجراءات هدفًا محدّدًا ومحدودًا: تجاوز الليلة، أو الصمود حتى الموعد. ولا يعالج أيٌّ منها السنّ.</p>

<h3>ما يخفّف فعلًا</h3>

<ol>
<li><strong>مسكّن بسيط</strong>، بالجرعات المعتادة المذكورة في النشرة الداخلية. <a href="/blog/paracetamol-maroc">الباراسيتامول</a> هو الخيار الأول عند غياب مضادّ استطباب؛ أما <a href="/blog/anti-inflammatoires-ains-maroc">مضادّ التهاب</a> مثل <a href="/blog/ibuprofene-maroc">الإيبوبروفين</a> فيعمل غالبًا بشكل أفضل على ألم التهابي، لكنه ليس بلا خطر (المعدة، الكلى، الحمل، الربو، الأدوية الجارية): اطلب رأي الصيدلي أو الطبيب قبل تناوله. ويمكنك الاطّلاع على بطاقات الأدوية المسوّقة في المغرب وأسعارها ونسبة تعويضها في <a href="/medicaments">قاعدة الأدوية</a> عندنا.</li>
<li><strong>مضمضة بماء مالح فاتر</strong> — نصف ملعقة صغيرة من الملح في كأس ماء، تُلفَظ ولا تُبلَع أبدًا. تُقتصر على البالغين والأطفال الكبار.</li>
<li><strong>البرودة على الوجنة</strong>، فوق قطعة قماش، لخمس عشرة دقيقة كحدّ أقصى. لا حرارة أبدًا على وجنة متورّمة: الحرارة تُسهّل انتشار العدوى.</li>
<li><strong>النوم برأس مرفوع</strong>، بوسادة إضافية. يزداد الألم في وضعية الاستلقاء لأن تدفّق الدم يرفع الضغط داخل السنّ — وهذا هو السبب الحقيقي لتفاقم ألم الأسنان ليلًا.</li>
<li><strong>تخفيف الجهد الميكانيكي</strong>: أطعمة طرية وفاترة، المضغ من الجهة الأخرى، فرشاة ناعمة، لا شديد الحرارة ولا شديد البرودة.</li>
</ol>

<h3>ستّة أخطاء تزيد الأمر سوءًا</h3>

<blockquote>انتبه. لا تضع <strong>أبدًا</strong> حبة أسبرين ولا زيت القرنفل الخالص مباشرة على اللثة: ذلك يُحدث حرقًا كيميائيًّا في الغشاء المخاطي، يُضاف إلى الألم الأصلي.</blockquote>

<ul>
<li><strong>إعادة تناول مضادّ حيوي من وصفة قديمة.</strong> هذا أكثر خطأ انتشارًا. يُخفي العلامات، ويؤخّر العلاج، ويشجّع المقاومة الجرثومية، ولا يمنع النكس. انظر مقالنا عن <a href="/blog/antibiotiques-maroc">الاستعمال الرشيد للمضادات الحيوية</a>.</li>
<li><strong>ثقب الخُراج أو الضغط عليه.</strong> التفريغ عمل طبّي يُنجَز تحت التخدير.</li>
<li><strong>تطبيق الحرارة</strong> على تورّم.</li>
<li><strong>تمرير الخيط السنّي حول السنّ المؤلم</strong> إذا كانت اللثة مُلتهبة: نظّف بقيّة الفم واترك هذه المنطقة.</li>
<li><strong>التدخين</strong> — سيجارة أو شيشة: التبغ يُبقي التهاب اللثة ويُبطئ الشفاء.</li>
<li><strong>انتظار أن «يمرّ الأمر».</strong> الألم الذي يزول دون علاج يعني في الغالب أن العصب قد مات، لا أن السنّ قد شُفي.</li>
</ul>

<h2>متى يجب التوجّه إلى المستعجلات؟</h2>

<p>يمكن لعدوى سنّية مُهمَلة أن تنتشر في أنسجة الوجه والرقبة، إلى حدّ إعاقة التنفّس. هذه الحالات لا تستدعي موعدًا بل مستعجلات فورية — اتّصل بالرقم <strong>141 (SAMU) أو 15</strong>:</p>

<ul>
<li>تورّم يبلغ العين أو أرضية الفم أو الرقبة؛</li>
<li>صعوبة في التنفّس أو البلع أو الكلام؛</li>
<li>استحالة فتح الفم بشكل طبيعي؛</li>
<li>حمّى شديدة، قشعريرة، تدهور الحالة العامة؛</li>
<li>ألم لا يمكن التحكّم فيه رغم المسكّنات؛</li>
<li>رَضّ مع سنّ مقتلع أو فكّ مؤلم بعد صدمة.</li>
</ul>

<p>ويجب تعزيز الحيطة في حالة <a href="/blog/diabete-type-2-maroc">السكري</a>، أو علاج مُثبِّط للمناعة، أو مرض في صمّامات القلب، أو بديل صمّامي: عند هؤلاء الأشخاص، تتفاقم العدوى السنّية أسرع وأقوى.</p>

<h2>ما يحدث عند طبيب الأسنان</h2>

<p>فهم مجرى الأمور يُزيل جزءًا كبيرًا من التوجّس — وهذا التوجّس هو السبب الأول لتأخّر العلاج.</p>

<p>تبدأ الاستشارة بـ<strong>فحص سريري</strong>: النظر، النقر على الأسنان، اختبار بالبرودة لمعرفة إن كان العصب حيًّا، وجَسّ اللثة والعقد اللمفية. ثم تُحدّد <strong>صورة شعاعية</strong> — ذَرْوية أو بانورامية إن كانت عدّة أسنان معنيّة — امتداد الإصابة وحالة العظم حول الجذر.</p>

<p>ويعتمد العلاج على ما يُكتشَف:</p>

<ul>
<li><strong>تسوّس دون إصابة العصب</strong> — تنظيف ثم حشو (مركّب). تكفي جلسة واحدة عمومًا.</li>
<li><strong>عصب مُصاب</strong> — <a href="/comment-traiter/carie-dentaire">سحب العصب</a>: تُنظَّف القناة وتُطهَّر ثم تُحشى. ويهدأ الألم في الغالب من هذه المرحلة.</li>
<li><strong>خُراج</strong> — <a href="/comment-traiter/abces-dentaire">تصريف</a> القيح ومعالجة القناة. هذا هو العمل الفعّال؛ ولا يأتي المضادّ الحيوي إلا مكمّلًا، في حالات معيّنة، و<strong>لا يُغني أبدًا عن معالجة السنّ</strong>.</li>
<li><strong>لثة مُصابة</strong> — إزالة الجير، تنظيف عميق، وأحيانًا تسوية سطح الجذور في <a href="/comment-traiter/gingivite">التهابات دواعم السن</a>.</li>
<li><strong>سنّ غير قابل للحفظ</strong> — القلع، ثم مناقشة بديل (جسر، طقم، أو <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">زرعة</a>).</li>
</ul>

<h3>أيّ ممارس نستشير؟</h3>

<p>في الغالبية الكبرى من الحالات، المخاطب المناسب هو <strong><a href="/specialites/chirurgie-dentaire">جرّاح الأسنان</a></strong>. فهو يعالج التسوّس والعدوى واللثة، ويقلع ويضع التعويضات. وهو نفسه من يوجّه إلى <em>أخصّائي دواعم السن</em> إذا كانت اللثة والعظم مُصابين بشدّة، وإلى <em>أخصّائي تقويم الأسنان</em> لمشكلة <a href="/symptomes/dents-mal-alignees">اصطفاف</a>، وإلى <em>أخصّائي جراحة الفم والوجه والفكّين</em> لقلع معقّد، وإلى <em>أخصّائي أسنان الأطفال</em> للصغار. وتُفصّل صفحتنا <a href="/quel-medecin-pour/mal-de-dents">أيّ طبيب لألم الأسنان</a> هذه الحالات.</p>

<h3>كم يكلّف ذلك وما الذي يغطّيه التأمين الإجباري (AMO)؟</h3>

<p>ثلاثة عناصر تجعل الفاتورة متغيّرة: <strong>طبيعة العمل</strong> (لا يُقارَن علاج تسوّس بسحب عصب مع تاج)، <strong>المدينة والعيادة</strong> — فالأتعاب حرّة في القطاع الخاص — و<strong>عدد الجلسات</strong> اللازمة. والخلاصة المالية بسيطة: كلّما أُخذ السنّ مبكّرًا، كان العلاج أخفّ وأقلّ تكلفة.</p>

<p>أما التغطية، فالتأمين الإجباري عن المرض يُعوّض جزءًا من العلاجات السنّية على أساس التسعير الوطني المرجعي — وهو حاليًّا في طور المراجعة — لا على أساس المبلغ المدفوع فعلًا: لذا يتوقّف الباقي على عاتقك على الفارق بين الاثنين. اطلب دائمًا <strong>تسعيرًا مكتوبًا</strong> قبل أيّ علاج تعويضي أو زرعة، واستخرج <strong>موافقة مسبقة</strong> عند طلبها. وتُفصّل صفحتانا <a href="/prix">أسعار الأعمال الطبية في المغرب</a> و<a href="/remboursement-amo-cnss">التعويض AMO / CNSS</a> النطاقات الملاحَظة وآلية التعويض؛ ويشرح مقالنا عن <a href="/blog/amo-remboursement-consultation-maroc">تعويض الاستشارة</a> الخطوات واحدة واحدة.</p>

<h2>حالات خاصة</h2>

<h3>عند الطفل</h3>

<p>يُعالَج ألم الأسنان عند الطفل كما عند البالغ، مع ثلاثة فوارق: <strong>لا أسبرين أبدًا</strong>، ولا زيت قرنفل على اللثة، ولا مضمضة عند الصغير الذي قد يبلعها. وتُحسب جرعة الباراسيتامول بالوزن لا بالعمر: انظر مقالنا عن <a href="/blog/paracetamol-maroc">الباراسيتامول</a>، ومقالنا عن <a href="/blog/fievre-enfant-que-faire-maroc">الحمّى عند الطفل</a> لمعرفة متى تجب الاستشارة. وقد يُزعج <a href="/questions/poussees-dentaires-du-bebe-quels-signes-et-comment-le-soulager">بزوغ الأسنان</a> عند الرضيع ويزيد اللُّعاب، لكنه لا يفسّر حمّى شديدة ولا إسهالًا: في هذه الحالة ابحث عن سبب آخر. انظر أيضًا <a href="/blog/sante-enfant-guide-maroc">دليلنا لصحة الطفل</a>.</p>

<h3>خلال الحمل</h3>

<p>العلاجات السنّية الجارية ممكنة بل مُستحسَنة خلال الحمل: فاللثة أهشّ في هذه الفترة، وخطر عدوى غير مُعالَجة أكبر من خطر العلاج. أبلغي دائمًا عن الحمل: يُكيّف الممارس المخدّر، ويتجنّب بعض الأدوية، ويؤجّل الصور الشعاعية غير الضرورية. والثلث الثاني من الحمل هو الأكثر راحة عادةً للأعمال المبرمَجة. انظري مقالنا عن <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>.</p>

<h3>تحت مضادّات التخثّر أو مضادّات التصفيح</h3>

<p><strong>لا توقف علاجك من تلقاء نفسك أبدًا</strong> قبل علاج سنّي: فخطر التوقّف أكبر عمومًا من خطر النزف. أبلِغ طبيب الأسنان، فهو يتّخذ الاحتياطات المناسبة ويتواصل مع طبيبك إن لزم. ويُفصّل مقالنا عن <a href="/blog/anticoagulants-maroc">مضادّات التخثّر</a> هذه الاحتياطات.</p>

<h3>مساءً، في عطلة نهاية الأسبوع أو أيام الأعياد</h3>

<p>إذا كان الألم محتمَلًا، تُمكّن الإجراءات المذكورة أعلاه من الانتظار حتى فتح العيادات. وإذا ظهرت علامة استعجال — تورّم، حمّى، صعوبة في البلع أو التنفّس — فلا تنتظر: توجّه إلى مستعجلات أقرب مستشفى أو اتّصل بالرقم <strong>141 (SAMU) أو 15</strong>. ولليوم الموالي، يمكنك <a href="/specialites/chirurgie-dentaire">البحث عن جرّاح أسنان حسب المدينة</a> وحجز موعد عبر الإنترنت.</p>

<h2>تفادي ألم الأسنان القادم</h2>

<p>هذا هو الجزء الأكثر مردودية في هذا المقال. فالغالبية العظمى من آلام الأسنان الحادّة تنتج عن إصابات كانت بلا ألم — أي قابلة للكشف — طوال أشهر.</p>

<ul>
<li><strong>التفريش مرّتين يوميًّا، دقيقتين في كل مرّة</strong>، بمعجون يحتوي على الفلور. هذا هو الإجراء الأفضل إثباتًا.</li>
<li><strong>التنظيف بين الأسنان</strong> مرّة يوميًّا: خيط أو فُرَش بينيّة. فالفرشاة وحدها لا تنظّف الأوجه التي ينشأ فيها معظم التسوّس.</li>
<li><strong>تقليل تواتر تناول السكّر</strong> أكثر من تقليل كمّيته. فكأس شاي شديد الحلاوة يُرتشف طوال الصباح أشدّ ضررًا من حلوى تُؤكل في نهاية وجبة: إذ إن الهجمات الحمضية المتكرّرة هي التي تُزيل معادن المينا. والمشروبات الغازية والعصائر الصناعية تفعل الفعل نفسه.</li>
<li><strong>الإقلاع عن التبغ والشيشة</strong> — عامل رئيسي في التهاب دواعم السن وفقد الأسنان. وقد يساعدك مقالنا عن <a href="/blog/arret-tabac-sevrage-maroc">الإقلاع عن التدخين</a>.</li>
<li><strong>زيارة مراقبة مرّة إلى مرّتين في السنة</strong>، حتى دون ألم، مع <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">إزالة الجير</a> حسب الحاجة. هذا ما يسمح بمعالجة تسوّس المينا في جلسة قصيرة بدلًا من التهاب لبّ مساء الأحد.</li>
<li><strong>مراقبة العلامات الخفيفة</strong>: <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">سنّ حسّاس</a>، <a href="/questions/mes-gencives-saignent-au-brossage-est-ce-une-gingivite-et-que-faire">لثة تنزف</a>، <a href="/symptomes/mauvaise-haleine">رائحة فم كريهة</a> مستمرّة، <a href="/questions/je-grince-des-dents-la-nuit-bruxisme-quelles-consequences-et-solutions">صريف ليلي</a>. هذه دعوات للاستشارة، لا تفاصيل ثانوية.</li>
</ul>

<p>لمزيد من التفصيل: <a href="/prevenir/carie-dentaire">الوقاية من تسوّس الأسنان</a>، <a href="/prevenir/gingivite">الوقاية من أمراض اللثة</a>، و<a href="/blog/prevention-sante-guide-maroc">دليلنا للوقاية الصحية</a>.</p>

<h2>الخلاصة</h2>

<p>ألم الأسنان إشارة، لا مرض في ذاته. إنه يدلّ على أن نسيجًا من السنّ أو اللثة مُصاب، والسؤال المفيد الوحيد هو: بأيّ سرعة يجب التحرّك؟ مسكّن وماء مالح يجعلان الليلة تمرّ؛ لكنهما لا يُغلقان تسوّسًا، ولا يُصرّفان خُراجًا، ولا يُصلحان لثة. وأمام تورّم أو حمّى أو صعوبة في البلع، لا مجال للتأجيل: هذا استعجال. وفي كل الحالات الأخرى، تُحوّل استشارة سريعة علاجًا ثقيلًا إلى علاج بسيط.</p>

<hr>

<p>سنّ يُؤلمك؟ على SantéauMaroc، <a href="/specialites/chirurgie-dentaire">اعثر على جرّاح أسنان قريب منك</a>، واطّلع على الملفات المتحقَّق منها وآراء المرضى، واحجز موعدك عبر الإنترنت بالمجان. وفي حال وجود علامة استعجال — تورّم في الوجه أو الرقبة، حمّى، صعوبة في التنفّس أو البلع — اتّصل فورًا بالرقم 141 (SAMU) أو 15.</p>', 'ألم الأسنان: تخفيف ألم حادّ | المغرب', 'ألم الأسنان: الأسباب، ما يخفّف فعلًا، الأخطاء التي يجب تفاديها، علامات الاستعجال ومجرى العلاج عند طبيب الأسنان. دليل ملائم للمغرب.', 'ألم الأسنان الحادّ يعبّر في الغالب عن تسوّس بلغ العصب: قد يتوقّف الألم، أما العدوى فتتابع.
المسكّن يخفّف ولا يعالج: جرّاح الأسنان وحده يعالج السبب.
استعجال فوري (141 SAMU أو 15) عند تورّم الوجه أو الرقبة، أو حمّى، أو صعوبة في التنفّس أو البلع أو فتح الفم.
لا تضع أبدًا أسبرين أو قرنفل على اللثة، ولا تُعِد مضادًّا حيويًّا من وصفة قديمة.
ألم أسنان يدوم أكثر من يومين يفرض استشارة، حتى إن هدأ.
في المغرب، 92 % من البالغين بين 35 و44 سنة مصابون بالتسوّس: المراقبة السنوية وإزالة الجير أكثر الإجراءات مردودية.', '[{"q":"كيف نخفّف ألم أسنان حادًّا بسرعة؟","a":"تناول مسكّنًا بسيطًا بجرعات النشرة الداخلية (الباراسيتامول خيارًا أول، ومضادّ الالتهاب برأي الصيدلي أو الطبيب)، وامضمض بماء مالح فاتر تلفظه، وضع البرودة على الوجنة فوق قطعة قماش، ونم برأس مرفوع، وامضغ من الجهة الأخرى. هذه الإجراءات تُمكّن من الانتظار حتى الموعد: لكنها لا تعالج السنّ."},{"q":"كم يدوم ألم الأسنان؟","a":"قد تدوم حساسية عابرة للبرد بضعة أيام. أما ألم الأسنان الذي يدوم أكثر من يومين، أو يُوقظ ليلًا، أو يعود، فلا يُحلّ من تلقاء نفسه ويفرض استشارة. وإذا زال بشكل مفاجئ دون علاج، فهذا يعني في الغالب أن العصب قد مات: بينما تتابع العدوى تطوّرها."},{"q":"باراسيتامول أم إيبوبروفين لألم الأسنان؟","a":"الباراسيتامول هو الخيار الأول لأنه الأفضل تحمّلًا. أما مضادّ الالتهاب مثل الإيبوبروفين فيعمل غالبًا بشكل أفضل على ألم ذي منشأ التهابي، لكنه ممنوع أو يجب تجنّبه في حالات عدّة (قرحة، مرض كلوي، حمل، ربو، بعض الأدوية). اطلب رأي الصيدلي أو الطبيب، واحترم جرعات النشرة."},{"q":"هل يحتاج ألم الأسنان إلى مضادّات حيوية؟","a":"لا، ليس بشكل منهجي. العلاج الفعّال لعدوى سنّية هو العمل الموضعي الذي يُنجزه طبيب الأسنان: معالجة القناة، أو تصريف الخُراج، أو القلع. ولا يُوصف المضادّ الحيوي إلا مكمّلًا في حالات معيّنة، ولا يُغني أبدًا عن معالجة السنّ. وإعادة تناول مضادّ حيوي من وصفة قديمة يُخفي العلامات ويؤخّر التكفّل ويشجّع المقاومة الجرثومية."},{"q":"هل القرنفل فعّال ضدّ ألم الأسنان؟","a":"لمادّته الفعّالة، الأوجينول، أثر مخدّر موضعي خفيف وعابر. لكن الزيت الأساسي الخالص أو حبّة القرنفل الموضوعة مباشرة على اللثة تُحدث حرقًا كيميائيًّا في الغشاء المخاطي، فيُضاف ألم إلى ألم. وهو ليس علاجًا ولا بديلًا عن الاستشارة."},{"q":"لماذا يزداد ألم الأسنان ليلًا؟","a":"في وضعية الاستلقاء، يزيد تدفّق الدم نحو الرأس من الضغط داخل لبّ السن، وهو أصلًا مُلتهب في تجويف لا يمكنه التوسّع. كما يزيد الهدوء وغياب المشتّتات من إدراك الألم. والنوم بوسادة إضافية يساعد فعلًا."},{"q":"هل يمكن أن نتألّم من سنّ دون تسوّس ظاهر؟","a":"نعم، وهذا شائع. قد يكون الأمر تشقّقًا، أو لثة متراجعة تكشف العنق، أو تسوّسًا تحت حشو قديم، أو صريف أسنان، أو مشكلة في مفصل الفكّ، أو التهاب جيوب فكّي، أو ألم العصب مثلّث التوائم. وتسمح الصورة الشعاعية والفحص السريري بالحكم."},{"q":"متى يصبح ألم الأسنان استعجالًا؟","a":"بمجرّد ظهور تورّم في الوجه أو أرضية الفم أو الرقبة، أو حمّى شديدة، أو صعوبة في التنفّس أو البلع أو الكلام، أو استحالة فتح الفم، أو ألم لا يمكن التحكّم فيه رغم المسكّنات. يجب حينها التوجّه إلى المستعجلات أو الاتّصال بالرقم 141 (SAMU) أو 15. كما أن سنًّا مقتلعًا بعد صدمة يُعدّ استعجالًا سنّيًّا."},{"q":"هل العلاجات السنّية مُعوَّضة في المغرب؟","a":"يُعوّض التأمين الإجباري عن المرض جزءًا من العلاجات السنّية، محسوبًا على أساس التسعير الوطني المرجعي — وهو حاليًّا في طور المراجعة — لا على أساس المبلغ المفوتَر فعلًا، لأن الأتعاب حرّة في القطاع الخاص. لذا يتوقّف الباقي على عاتقك على هذا الفارق. اطلب تسعيرًا مكتوبًا قبل أيّ علاج تعويضي أو زرعة، وموافقة مسبقة عند طلبها."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- abces-dentaire-maroc  (satellite du pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdcmnk30000bgnpgsjg1yef', 'Abcès dentaire : reconnaître l''urgence et se faire soigner', 'abces-dentaire-maroc', 'Abcès dentaire : les signes qui ne trompent pas, à quel moment cela devient une urgence, ce qu''il faut faire et surtout ne pas faire en attendant, et pourquoi le drainage — pas l''antibiotique — est le vrai traitement.', '<p>Un abcès dentaire n''est pas une grosse carie : c''est une <strong>infection installée</strong>, avec du pus, dans un espace fermé. C''est ce qui explique à la fois la violence de la douleur et le fait qu''un abcès ne se règle jamais tout seul. C''est aussi la situation dentaire qui envoie le plus de patients aux urgences hospitalières, souvent après plusieurs jours d''attente et un antibiotique pris au hasard.</p>

<p>Cet article explique comment reconnaître un abcès, à quel moment il devient une urgence vitale, ce qu''il faut faire en attendant, et pourquoi le geste du dentiste — et non le comprimé — est le vrai traitement. Pour la douleur dentaire en général, voir notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents : soulager une rage de dents</a>.</p>

<h2>Qu''est-ce qu''un abcès dentaire ?</h2>

<p>Des bactéries franchissent une barrière — une <a href="/maladies/carie-dentaire">carie</a> profonde, une fêlure, une dent dévitalisée qui a repris l''infection, ou un sillon gingival malade — et se multiplient dans un tissu qui ne peut pas se drainer. Le pus s''accumule sous pression. Le corps réagit : inflammation, gonflement, fièvre parfois.</p>

<h3>Deux abcès qui ne se soignent pas de la même façon</h3>

<ul>
<li><strong>L''abcès d''origine dentaire</strong> (périapical) part de la pulpe morte et se développe à la pointe de la racine, dans l''os. La dent est généralement <em>très</em> sensible à la percussion et donne l''impression d''être « plus haute » que les autres.</li>
<li><strong>L''abcès de la gencive</strong> (parodontal) part d''une poche gingivale infectée. La dent est souvent mobile, la gencive gonflée et rouge à un endroit précis, avec parfois un écoulement de pus au collet. Il s''inscrit dans une <a href="/blog/parodontite-dechaussement-dents-maroc">parodontite</a>.</li>
</ul>

<p>Un troisième cas fréquent est l''infection de la gencive qui recouvre une <a href="/blog/dent-de-sagesse-extraction-maroc">dent de sagesse</a> mal sortie (péricoronarite), avec douleur au fond de la mâchoire et difficulté à ouvrir la bouche.</p>

<h2>Les signes qui doivent faire penser à un abcès</h2>

<ul>
<li>Douleur <strong>pulsatile</strong>, continue, qui bat au rythme du cœur et s''aggrave en position allongée.</li>
<li>Dent qui ne supporte plus le contact : mastiquer, ou même fermer la bouche, devient douloureux.</li>
<li><strong>Gonflement</strong> de la gencive, de la joue ou de la lèvre, parfois de tout un côté du visage.</li>
<li>Mauvais goût persistant, mauvaise haleine soudaine, écoulement de pus — le goût désagréable qui apparaît brutalement avec un soulagement de la douleur signe souvent une fistule, c''est-à-dire un abcès qui s''est vidé partiellement. <strong>Ce n''est pas une guérison.</strong></li>
<li>Ganglion douloureux sous la mâchoire ou dans le cou.</li>
<li>Fièvre, frissons, fatigue inhabituelle.</li>
</ul>

<blockquote>Un point est contre-intuitif et coûte cher : la douleur d''un abcès peut disparaître d''un coup. Cela signifie que le nerf est mort ou que le pus s''est frayé un chemin, pas que l''infection est éteinte. Elle continue à travailler dans l''os.</blockquote>

<h2>Quand est-ce une urgence ?</h2>

<p>Un abcès dentaire peut diffuser dans les espaces du visage et du cou, jusqu''à comprimer les voies aériennes. Ces signes imposent les urgences immédiatement — appelez le <strong>141 (SAMU) ou le 15</strong> :</p>

<ul>
<li>gonflement qui atteint l''œil, le plancher de la bouche, la gorge ou le cou ;</li>
<li>difficulté à respirer, à avaler sa salive ou à parler ;</li>
<li>impossibilité d''ouvrir la bouche (trismus) ;</li>
<li>fièvre élevée avec frissons, confusion, malaise ;</li>
<li>douleur incontrôlable malgré les antalgiques.</li>
</ul>

<p>Sans ces signes, il ne s''agit pas d''une urgence vitale, mais d''une <strong>urgence de soins</strong> : le rendez-vous doit être pris le jour même ou le lendemain, pas « la semaine prochaine ».</p>

<h2>En attendant le rendez-vous</h2>

<p>Ces mesures visent à limiter la douleur sans aggraver l''infection. Aucune ne remplace le soin.</p>

<ul>
<li><strong>Un antalgique simple</strong> aux doses de la notice — le <a href="/blog/paracetamol-maroc">paracétamol</a> en premier choix ; un <a href="/blog/anti-inflammatoires-ains-maroc">anti-inflammatoire</a> peut mieux agir mais n''est pas anodin : avis du pharmacien ou du médecin. La fiche des spécialités vendues au Maroc est dans notre <a href="/medicaments">base des médicaments</a>.</li>
<li><strong>Du froid sur la joue</strong>, à travers un linge, quinze minutes maximum. <strong>Jamais de chaleur</strong> : elle accélère la diffusion de l''infection.</li>
<li><strong>Dormir la tête surélevée</strong>, alimentation molle et tiède, mastication de l''autre côté.</li>
<li><strong>Bain de bouche à l''eau salée tiède</strong>, à recracher (adultes et grands enfants).</li>
</ul>

<p>À l''inverse, quatre gestes aggravent régulièrement la situation : <strong>percer ou presser l''abcès</strong>, <strong>appliquer de la chaleur</strong>, <strong>poser de l''aspirine ou du clou de girofle sur la gencive</strong> (brûlure chimique), et <strong>reprendre un antibiotique d''une ancienne ordonnance</strong>. Ce dernier point est le plus fréquent : il atténue les signes, retarde le drainage, et favorise la résistance bactérienne. Voir notre article sur le <a href="/blog/antibiotiques-maroc">bon usage des antibiotiques</a>.</p>

<h2>Le traitement chez le dentiste</h2>

<h3>Le drainage, geste central</h3>

<p>Le principe est mécanique avant d''être médicamenteux : il faut <strong>évacuer le pus et supprimer la source</strong>. Selon l''origine, le praticien ouvre la dent pour nettoyer et désinfecter les canaux, incise la gencive pour drainer une collection, assainit une poche parodontale, ou extrait la dent si elle n''est pas conservable. Le soulagement est le plus souvent net dans les heures qui suivent.</p>

<h3>La place réelle des antibiotiques</h3>

<p>Les antibiotiques ne sont pas systématiques. Ils viennent en <strong>complément</strong> du geste local dans certaines situations — infection diffusée, fièvre, terrain fragilisé — et l''<a href="/glossaire/antibiotique">antibiotique</a> seul, sans soin de la dent, expose à la récidive et aux complications. La molécule, la durée et les alternatives en cas d''allergie relèvent de la prescription : c''est le praticien qui décide, jamais l''armoire à pharmacie.</p>

<h3>Garder ou extraire la dent ?</h3>

<p>La décision dépend de ce qu''il reste de dent utilisable, de l''état de l''os autour de la racine et de la faisabilité du traitement canalaire. Une dent dévitalisée puis reconstituée peut durer des années ; à l''inverse, s''acharner sur une dent condamnée fait perdre de l''os et compromet le remplacement futur, qu''il s''agisse d''un bridge ou d''un <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>. Demandez un <strong>devis écrit</strong> avant tout acte prothétique ; nos pages <a href="/prix">tarifs des actes</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> expliquent la mécanique du reste à charge.</p>

<h2>Après le soin : ce qui est normal, ce qui ne l''est pas</h2>

<p>Le soulagement est en général rapide, mais il n''est pas toujours immédiat : une gêne, une sensibilité à la pression et un gonflement résiduel peuvent persister deux à trois jours, le temps que l''inflammation reflue. Un traitement de canal se déroule souvent en plusieurs séances, et il est important de <strong>les honorer toutes</strong> : une dent laissée ouverte ou une désinfection interrompue se réinfecte presque systématiquement.</p>

<p>En revanche, doivent faire rappeler le praticien : une douleur qui <strong>augmente</strong> après le deuxième jour, un gonflement qui progresse, une fièvre qui apparaît ou revient, un écoulement de pus qui persiste, ou un saignement qui ne se tarit pas. Ce sont les mêmes signes d''alerte que ceux listés plus haut qui commandent, à leur stade extrême, un passage aux urgences.</p>

<h2>Ce qui arrive quand on laisse traîner</h2>

<p>L''infection ne reste pas au même endroit. Elle suit les chemins de moindre résistance, et l''évolution typique se compte en jours, pas en mois :</p>

<ul>
<li><strong>Destruction de l''os</strong> autour de la racine : la lésion s''élargit et compromet la conservation de la dent, puis la pose ultérieure d''un implant faute de volume osseux.</li>
<li><strong>Diffusion dans les tissus du visage et du cou</strong> (cellulite cervico-faciale) : le gonflement dépasse la zone de la dent, l''ouverture de la bouche se limite, la déglutition devient difficile. C''est une urgence chirurgicale.</li>
<li><strong>Atteinte du sinus maxillaire</strong> pour les dents du haut, avec un tableau qui ressemble à une <a href="/maladies/sinusite">sinusite</a> qui résiste aux traitements habituels.</li>
<li><strong>Passage dans le sang</strong>, avec risque de localisation à distance, en particulier chez les personnes à risque cardiaque ou immunodéprimées.</li>
</ul>

<p>Ces complications sont rares au regard du nombre d''abcès traités, mais elles ne sont pas exceptionnelles — et elles surviennent presque toujours après plusieurs jours d''automédication, chez quelqu''un qui espérait passer le week-end.</p>

<h2>Terrains qui demandent plus de vigilance</h2>

<ul>
<li><strong><a href="/blog/diabete-type-2-maroc">Diabète</a></strong> : l''infection se contrôle moins bien et la cicatrisation est plus lente ; à l''inverse, une infection dentaire déséquilibre la glycémie. Le lien fonctionne dans les deux sens.</li>
<li><strong>Immunodépression</strong> (traitement immunosuppresseur, chimiothérapie, corticothérapie au long cours) : consultation sans délai.</li>
<li><strong>Cardiopathie à risque, prothèse valvulaire</strong> : signalez-le, une prévention spécifique peut s''appliquer avant certains gestes.</li>
<li><strong>Grossesse</strong> : les soins sont possibles et nécessaires — une infection non traitée est plus risquée que le soin. Signalez la grossesse ; voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</li>
<li><strong>Traitement anticoagulant ou antiagrégant</strong> : ne l''arrêtez jamais de vous-même, signalez-le. Voir <a href="/blog/anticoagulants-maroc">anticoagulants</a>.</li>
</ul>

<h3>Et chez l''enfant ?</h3>

<p>Une dent de lait peut parfaitement faire un abcès, et l''idée qu''« elle va tomber de toute façon » est trompeuse : l''infection siège au contact du germe de la dent définitive, qu''elle peut abîmer, et elle est douloureuse. Un gonflement de la joue chez un enfant, surtout avec de la fièvre ou un abattement, impose une consultation rapide — voir notre article <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l''enfant</a>. Deux règles s''ajoutent à celles de l''adulte : <strong>jamais d''aspirine</strong> et pas de bain de bouche chez le petit qui risque de l''avaler. Le paracétamol se dose au poids, non à l''âge : voir notre article sur le <a href="/blog/paracetamol-maroc">paracétamol</a> et notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l''enfant</a>.</p>

<h2>Éviter la récidive</h2>

<p>Un abcès est presque toujours l''aboutissement de quelque chose qu''on a laissé courir. Trois leviers réduisent nettement le risque : terminer les traitements commencés (une dent ouverte ou une dévitalisation non finie se réinfecte), traiter les caries et les gencives avant qu''elles ne fassent mal — voir <a href="/prevenir/carie-dentaire">prévenir la carie</a> et <a href="/prevenir/gingivite">prévenir la maladie des gencives</a> — et maintenir un contrôle une à deux fois par an avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a>. Le <a href="/blog/arret-tabac-sevrage-maroc">tabac</a>, cigarette comme chicha, augmente le risque infectieux et ralentit la cicatrisation.</p>

<p>Deux réflexes complètent utilement ce socle. D''abord, ne pas ignorer les signaux faibles : une <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">dent devenue sensible</a>, une gencive qui saigne, une dent qui a changé de teinte après un choc ancien. Ensuite, faire vérifier les dents dévitalisées de longue date, qui peuvent se réinfecter en silence des années plus tard et ne se manifester qu''à l''occasion d''une radio de contrôle.</p>

<h2>En résumé</h2>

<p>Un abcès dentaire est une infection sous pression, pas une douleur passagère. Le geste du dentiste — ouvrir, drainer, traiter la cause — est le seul traitement ; l''antalgique fait patienter et l''antibiotique, quand il est indiqué, accompagne sans remplacer. Le mauvais scénario est toujours le même : trois jours d''automédication, une douleur qui s''efface, puis un gonflement qui envoie aux urgences. Pour savoir vers qui vous tourner selon la situation, voir <a href="/quel-medecin-pour/mal-de-dents">quel médecin consulter pour un mal de dents</a>.</p>

<hr>

<p>Un gonflement ou une douleur pulsatile ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a> et prenez rendez-vous en ligne. En présence de fièvre, d''un gonflement du visage ou du cou, ou d''une difficulté à respirer ou à avaler, appelez immédiatement le 141 (SAMU) ou le 15.</p>', '/blog-covers/post-abces-dentaire-maroc.jpg', 'Équipe dentaire réalisant un soin au fauteuil, aspiration en cours', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 9, 'Abcès dentaire : signes, urgence, traitement', 'Abcès dentaire : reconnaître les signes, savoir quand c''est une urgence, ce qui soulage sans aggraver et le vrai traitement chez le dentiste.', 'Un abcès dentaire est une infection avec du pus : il ne guérit jamais seul.
Le traitement, c''est le drainage par le dentiste ; l''antibiotique n''est qu''un complément, parfois inutile.
Douleur qui disparaît + mauvais goût = abcès qui s''est vidé en partie, pas guérison.
Urgence (141 SAMU ou 15) si gonflement de l''œil, du cou ou du plancher de la bouche, fièvre, difficulté à respirer, avaler ou ouvrir la bouche.
Jamais de chaleur sur la joue, jamais d''antibiotique repris d''une ancienne ordonnance.', '[{"q":"Un abcès dentaire peut-il guérir tout seul ?","a":"Non. Le pus est enfermé dans un espace qui ne se draine pas spontanément. La douleur peut cesser, notamment si l''abcès se vide partiellement par une fistule ou si le nerf meurt, mais l''infection continue d''évoluer dans l''os. Seul un geste dentaire — drainage, traitement du canal ou extraction — met fin au processus."},{"q":"Combien de temps peut-on attendre avec un abcès dentaire ?","a":"En l''absence de signe d''alerte, l''objectif est une consultation le jour même ou le lendemain. En présence d''un gonflement du visage ou du cou, d''une fièvre, d''une difficulté à respirer, à avaler ou à ouvrir la bouche, il ne faut pas attendre du tout : ce sont les urgences, en appelant le 141 (SAMU) ou le 15."},{"q":"Faut-il des antibiotiques pour un abcès dentaire ?","a":"Pas systématiquement. Le traitement efficace est le geste local réalisé par le dentiste. Les antibiotiques sont prescrits en complément dans certaines situations — infection diffusée, fièvre, terrain fragilisé — et jamais à la place du soin. Un antibiotique pris seul soulage temporairement puis laisse revenir l''infection."},{"q":"Peut-on percer un abcès dentaire soi-même ?","a":"Non. Percer ou presser expose à une diffusion de l''infection dans les tissus profonds du visage et du cou, et à une surinfection. Le drainage est un acte réalisé sous anesthésie, avec un matériel stérile, suivi du traitement de la cause."},{"q":"Chaud ou froid sur la joue en cas d''abcès ?","a":"Du froid, à travers un linge, quinze minutes maximum. La chaleur favorise la diffusion de l''infection dans les tissus : ni compresse chaude, ni bouillotte, ni bain de bouche brûlant."},{"q":"L''abcès dentaire est-il contagieux ?","a":"L''abcès en lui-même ne se transmet pas. Les bactéries buccales, elles, s''échangent par la salive, mais c''est l''état de la dent et des gencives de chacun qui détermine le risque d''infection. Il n''y a pas lieu d''isoler la personne concernée."},{"q":"Une dent dévitalisée peut-elle refaire un abcès ?","a":"Oui. Si des bactéries subsistent ou reviennent dans les canaux, ou si l''étanchéité de l''obturation se dégrade, une infection peut réapparaître à la pointe de la racine, parfois des années plus tard. Le traitement consiste alors à reprendre le traitement canalaire, ou à recourir à un geste chirurgical."}]', '[{"label":"Le traitement et l''évolution d''un abcès dentaire","url":"https://www.ameli.fr/assure/sante/themes/abces-dentaire/traitement-abces-dentaire","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Douleurs au niveau des dents et de la bouche : quelles causes ?","url":"https://www.ameli.fr/assure/sante/themes/douleurs-dentaires-bouche/causes-douleurs","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Prescription des antibiotiques en pratique bucco-dentaire — recommandations","url":"https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf","publisher":"ANSM","year":"2011"},{"label":"Toothache — soulagement et signes d''urgence","url":"https://www.nhs.uk/conditions/toothache/","publisher":"National Health Service (NHS)"},{"label":"Santé bucco-dentaire — principaux repères","url":"https://www.who.int/fr/news-room/fact-sheets/detail/oral-health","publisher":"Organisation mondiale de la Santé (OMS)","year":"2025"}]', 'Abcès dentaire', (SELECT id FROM posts WHERE slug = 'mal-de-dents-rage-de-dents-maroc'), 'الخُراج السنّي: التعرّف على الاستعجال والحصول على العلاج', 'الخُراج السنّي: العلامات التي لا تُخطئ، اللحظة التي يصبح فيها استعجالًا، ما يجب فعله وخاصة ما يجب تفاديه في الانتظار، ولماذا التصريف — لا المضادّ الحيوي — هو العلاج الحقيقي.', '<p>الخُراج السنّي ليس تسوّسًا كبيرًا: إنه <strong>عدوى مستقرّة</strong>، بقيح، في حيّز مغلق. وهذا ما يفسّر في الوقت نفسه شدّة الألم وكون الخُراج لا يُحلّ أبدًا من تلقاء نفسه. وهو أيضًا الحالة السنّية التي تُرسل أكبر عدد من المرضى إلى مستعجلات المستشفى، غالبًا بعد أيام من الانتظار ومضادّ حيوي أُخذ عشوائيًّا.</p>

<p>يشرح هذا المقال كيف نتعرّف على الخُراج، وفي أيّ لحظة يصبح استعجالًا حيويًّا، وما يجب فعله في الانتظار، ولماذا يكون عمل طبيب الأسنان — وليس الحبّة — هو العلاج الحقيقي. ولألم الأسنان عمومًا، انظر دليلنا <a href="/blog/mal-de-dents-rage-de-dents-maroc">ألم الأسنان: تخفيف ألم حادّ</a>.</p>

<h2>ما هو الخُراج السنّي؟</h2>

<p>تتجاوز الجراثيم حاجزًا — <a href="/maladies/carie-dentaire">تسوّسًا</a> عميقًا، أو تشقّقًا، أو سنًّا مسحوب العصب عادت إليه العدوى، أو أخدودًا لثويًّا مريضًا — وتتضاعف في نسيج لا يمكنه التصريف. يتراكم القيح تحت الضغط. ويتفاعل الجسم: التهاب، تورّم، وحمّى أحيانًا.</p>

<h3>خُراجان لا يُعالَجان بالطريقة نفسها</h3>

<ul>
<li><strong>الخُراج ذو المنشأ السنّي</strong> (حول ذَرْوي) ينطلق من لبّ ميت ويتطوّر عند قمة الجذر، داخل العظم. ويكون السنّ عمومًا <em>شديد</em> الحساسية للنقر ويعطي إحساسًا بأنه «أعلى» من غيره.</li>
<li><strong>خُراج اللثة</strong> (حول سنّي) ينطلق من جيب لثوي مُصاب بالعدوى. ويكون السنّ غالبًا متحرّكًا، واللثة متورّمة وحمراء في موضع محدّد، مع سيلان قيح عند العنق أحيانًا. ويندرج ضمن <a href="/blog/parodontite-dechaussement-dents-maroc">التهاب دواعم السن</a>.</li>
</ul>

<p>وهناك حالة ثالثة شائعة: عدوى اللثة التي تغطّي <a href="/blog/dent-de-sagesse-extraction-maroc">ضرس عقل</a> بزغ بشكل سيّئ (التهاب ما حول التاج)، مع ألم في عمق الفكّ وصعوبة في فتح الفم.</p>

<h2>العلامات التي تُوجّه إلى خُراج</h2>

<ul>
<li>ألم <strong>نابض</strong>، متواصل، ينبض على وقع القلب ويتفاقم في وضعية الاستلقاء.</li>
<li>سنّ لا يتحمّل التلامس: يصبح المضغ، أو حتى إغلاق الفم، مؤلمًا.</li>
<li><strong>تورّم</strong> في اللثة أو الوجنة أو الشفة، وأحيانًا في جانب كامل من الوجه.</li>
<li>طعم سيّئ مستمرّ، رائحة فم كريهة مفاجئة، سيلان قيح — والطعم المزعج الذي يظهر بشكل مفاجئ مع هدوء الألم يدلّ غالبًا على ناسور، أي خُراج تصرّف جزئيًّا. <strong>وهذا ليس شفاءً.</strong></li>
<li>عقدة لمفية مؤلمة تحت الفكّ أو في الرقبة.</li>
<li>حمّى، قشعريرة، تعب غير معتاد.</li>
</ul>

<blockquote>نقطة مخالفة للبديهة وتكلّف غاليًا: قد يزول ألم الخُراج دفعة واحدة. وهذا يعني أن العصب مات أو أن القيح وجد له منفذًا، لا أن العدوى انطفأت. إنها تتابع عملها في العظم.</blockquote>

<h2>متى يكون استعجالًا؟</h2>

<p>يمكن للخُراج السنّي أن ينتشر في حيّزات الوجه والرقبة، إلى حدّ الضغط على المسالك الهوائية. هذه العلامات تفرض المستعجلات فورًا — اتّصل بالرقم <strong>141 (SAMU) أو 15</strong>:</p>

<ul>
<li>تورّم يبلغ العين أو أرضية الفم أو الحلق أو الرقبة؛</li>
<li>صعوبة في التنفّس أو في بلع اللعاب أو في الكلام؛</li>
<li>استحالة فتح الفم (ضزز)؛</li>
<li>حمّى شديدة مع قشعريرة، تخليط، توعّك؛</li>
<li>ألم لا يمكن التحكّم فيه رغم المسكّنات.</li>
</ul>

<p>وفي غياب هذه العلامات، لا يتعلّق الأمر باستعجال حيوي، بل بـ<strong>استعجال علاجي</strong>: يجب أخذ الموعد في اليوم نفسه أو الموالي، لا «الأسبوع القادم».</p>

<h2>في انتظار الموعد</h2>

<p>تستهدف هذه الإجراءات الحدّ من الألم دون تفاقم العدوى. ولا يُغني أيٌّ منها عن العلاج.</p>

<ul>
<li><strong>مسكّن بسيط</strong> بجرعات النشرة الداخلية — <a href="/blog/paracetamol-maroc">الباراسيتامول</a> خيارًا أول؛ وقد يعمل <a href="/blog/anti-inflammatoires-ains-maroc">مضادّ الالتهاب</a> بشكل أفضل لكنه ليس بلا خطر: رأي الصيدلي أو الطبيب. وبطاقات الأدوية المسوّقة في المغرب في <a href="/medicaments">قاعدة الأدوية</a> عندنا.</li>
<li><strong>البرودة على الوجنة</strong>، فوق قطعة قماش، لخمس عشرة دقيقة كحدّ أقصى. <strong>لا حرارة أبدًا</strong>: فهي تُسرّع انتشار العدوى.</li>
<li><strong>النوم برأس مرفوع</strong>، تغذية طرية وفاترة، ومضغ من الجهة الأخرى.</li>
<li><strong>مضمضة بماء مالح فاتر</strong>، تُلفَظ (للبالغين والأطفال الكبار).</li>
</ul>

<p>وعلى العكس، أربعة أفعال تُفاقم الوضع بشكل متكرّر: <strong>ثقب الخُراج أو الضغط عليه</strong>، و<strong>تطبيق الحرارة</strong>، و<strong>وضع أسبرين أو قرنفل على اللثة</strong> (حرق كيميائي)، و<strong>إعادة تناول مضادّ حيوي من وصفة قديمة</strong>. وهذه الأخيرة هي الأكثر شيوعًا: تُخفّف العلامات، وتؤخّر التصريف، وتشجّع المقاومة الجرثومية. انظر مقالنا عن <a href="/blog/antibiotiques-maroc">الاستعمال الرشيد للمضادات الحيوية</a>.</p>

<h2>العلاج عند طبيب الأسنان</h2>

<h3>التصريف، العمل المركزي</h3>

<p>المبدأ ميكانيكي قبل أن يكون دوائيًّا: يجب <strong>إخراج القيح وإزالة المصدر</strong>. وحسب المنشأ، يفتح الممارس السنّ لتنظيف القنوات وتطهيرها، أو يشقّ اللثة لتصريف تجمّع قيحي، أو ينظّف جيبًا حول سنّي، أو يقلع السنّ إن لم يكن قابلًا للحفظ. ويكون الارتياح في الغالب واضحًا في الساعات التالية.</p>

<h3>المكانة الحقيقية للمضادات الحيوية</h3>

<p>المضادات الحيوية ليست منهجية. فهي تأتي <strong>مكمّلة</strong> للعمل الموضعي في حالات معيّنة — عدوى منتشرة، حمّى، أرضية هشّة — و<a href="/glossaire/antibiotique">المضادّ الحيوي</a> وحده، دون معالجة السنّ، يُعرّض للنكس والمضاعفات. أما الجزيء والمدّة والبدائل في حالة الحساسية فتخصّ الوصفة الطبية: الممارس هو من يقرّر، لا خزانة الأدوية المنزلية.</p>

<h3>حفظ السنّ أم قلعه؟</h3>

<p>يتوقّف القرار على ما بقي من سنّ قابل للاستعمال، وعلى حالة العظم حول الجذر، وعلى إمكانية معالجة القناة. فسنّ مسحوب العصب ثم مُعاد بناؤه قد يدوم سنوات؛ وفي المقابل، الإصرار على سنّ محكوم عليه يُفقد العظم ويُضرّ بالبديل المستقبلي، سواء كان جسرًا أو <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">زرعة</a>. اطلب <strong>تسعيرًا مكتوبًا</strong> قبل أيّ عمل تعويضي؛ وتشرح صفحتانا <a href="/prix">أسعار الأعمال</a> و<a href="/remboursement-amo-cnss">التعويض AMO / CNSS</a> آلية الباقي على عاتقك.</p>

<h2>بعد العلاج: ما هو طبيعي وما ليس كذلك</h2>

<p>الارتياح سريع عمومًا، لكنه ليس فوريًّا دائمًا: قد يستمرّ انزعاج وحساسية للضغط وتورّم متبقٍّ يومين أو ثلاثة، ريثما يتراجع الالتهاب. وتجري معالجة القناة غالبًا في عدّة جلسات، ومن المهمّ <strong>احترامها كلّها</strong>: فسنّ يُترك مفتوحًا أو سحب عصب لم يُكمَل يعود إليه الخمج في شبه كل الحالات.</p>

<p>وفي المقابل، يجب الاتّصال بالممارس عند ألم <strong>يتزايد</strong> بعد اليوم الثاني، أو تورّم يتقدّم، أو حمّى تظهر أو تعود، أو سيلان قيح مستمرّ، أو نزف لا يتوقّف. وهي العلامات نفسها المذكورة أعلاه التي تفرض، في درجتها القصوى، المرور إلى المستعجلات.</p>

<h2>ما يحدث عند الإهمال</h2>

<p>العدوى لا تبقى في مكانها. إنها تسلك مسالك المقاومة الأقلّ، والتطوّر النمطي يُحسب بالأيام لا بالأشهر:</p>

<ul>
<li><strong>تدمير العظم</strong> حول الجذر: تتوسّع الإصابة فتُضرّ بحفظ السنّ، ثم بوضع زرعة لاحقًا بسبب نقص حجم العظم.</li>
<li><strong>الانتشار في أنسجة الوجه والرقبة</strong> (التهاب خلوي رقبي وجهي): يتجاوز التورّم منطقة السنّ، ويتحدّد فتح الفم، ويصبح البلع صعبًا. وهذا استعجال جراحي.</li>
<li><strong>إصابة الجيب الفكّي</strong> بالنسبة للأسنان العلوية، بصورة تشبه <a href="/maladies/sinusite">التهاب جيوب</a> يقاوم العلاجات المعتادة.</li>
<li><strong>الانتقال إلى الدم</strong>، مع خطر توضّع بعيد، خاصة عند أصحاب المخاطر القلبية أو نقص المناعة.</li>
</ul>

<p>هذه المضاعفات نادرة بالنظر إلى عدد الخُراجات المعالَجة، لكنها ليست استثنائية — وهي تحدث في شبه كل الحالات بعد أيام من التداوي الذاتي، عند شخص كان يأمل تجاوز عطلة نهاية الأسبوع.</p>

<h2>أرضيات تستوجب حيطة أكبر</h2>

<ul>
<li><strong><a href="/blog/diabete-type-2-maroc">السكري</a></strong>: تُضبَط العدوى بشكل أقلّ ويكون الشفاء أبطأ؛ وفي المقابل، تُخلّ عدوى سنّية بتوازن السكر في الدم. والعلاقة تعمل في الاتجاهين.</li>
<li><strong>نقص المناعة</strong> (علاج مثبِّط للمناعة، معالجة كيميائية، كورتيزون طويل الأمد): استشارة دون تأخير.</li>
<li><strong>مرض قلبي ذو خطر، بديل صمّامي</strong>: أبلِغ عن ذلك، فقد تُطبّق وقاية خاصة قبل بعض الأعمال.</li>
<li><strong>الحمل</strong>: العلاجات ممكنة وضرورية — فعدوى غير مُعالَجة أخطر من العلاج. أبلِغي عن الحمل؛ انظري مقالنا عن <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>.</li>
<li><strong>علاج بمضادّات التخثّر أو مضادّات التصفيح</strong>: لا توقفه من تلقاء نفسك أبدًا، وأبلِغ عنه. انظر <a href="/blog/anticoagulants-maroc">مضادّات التخثّر</a>.</li>
</ul>

<h3>وعند الطفل؟</h3>

<p>يمكن لسنّ لبني أن يُحدث خُراجًا تمامًا، وفكرة أنه «سيسقط في كل الأحوال» مضلّلة: فالعدوى تقع على تماسّ مع بُرعم السنّ الدائم الذي قد تُتلفه، وهي مؤلمة. وتورّم الوجنة عند طفل، خاصة مع حمّى أو فتور، يفرض استشارة سريعة — انظر مقالنا <a href="/blog/fievre-enfant-que-faire-maroc">الحمّى عند الطفل</a>. وتُضاف قاعدتان إلى قواعد البالغ: <strong>لا أسبرين أبدًا</strong> ولا مضمضة عند الصغير الذي قد يبلعها. وتُحسب جرعة الباراسيتامول بالوزن لا بالعمر: انظر مقالنا عن <a href="/blog/paracetamol-maroc">الباراسيتامول</a> و<a href="/blog/sante-enfant-guide-maroc">دليلنا لصحة الطفل</a>.</p>

<h2>تفادي النكس</h2>

<p>الخُراج هو في الغالب حصيلة شيء تُرك يتقدّم. ثلاث روافع تُقلّص الخطر بوضوح: إتمام العلاجات التي بُدئت (فسنّ مفتوح أو سحب عصب غير مكتمل يعود إليه الخمج)، ومعالجة التسوّس واللثة قبل أن تؤلم — انظر <a href="/prevenir/carie-dentaire">الوقاية من التسوّس</a> و<a href="/prevenir/gingivite">الوقاية من أمراض اللثة</a> — والحفاظ على مراقبة مرّة إلى مرّتين سنويًّا مع <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">إزالة الجير</a>. و<a href="/blog/arret-tabac-sevrage-maroc">التبغ</a>، سيجارة أو شيشة، يزيد الخطر الخمجي ويُبطئ الشفاء.</p>

<p>ويكمّل هذا الأساس ردّان مفيدان. أوّلًا، عدم تجاهل العلامات الخفيفة: <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">سنّ صار حسّاسًا</a>، لثة تنزف، سنّ تغيّر لونه بعد صدمة قديمة. وثانيًا، فحص الأسنان المسحوبة العصب منذ زمن، فقد يعود إليها الخمج في صمت بعد سنوات ولا تظهر إلا في صورة مراقبة.</p>

<h2>الخلاصة</h2>

<p>الخُراج السنّي عدوى تحت الضغط، لا ألم عابر. وعمل طبيب الأسنان — الفتح، التصريف، معالجة السبب — هو العلاج الوحيد؛ والمسكّن يجعلك تنتظر، والمضادّ الحيوي، حين يُستطبّ، يواكب ولا يُغني. والسيناريو السيّئ هو نفسه دائمًا: ثلاثة أيام من التداوي الذاتي، ألم يخبو، ثم تورّم يُرسل إلى المستعجلات. ولمعرفة إلى من تتوجّه حسب الحالة، انظر <a href="/quel-medecin-pour/mal-de-dents">أيّ طبيب تستشير لألم الأسنان</a>.</p>

<hr>

<p>تورّم أو ألم نابض؟ على SantéauMaroc، <a href="/specialites/chirurgie-dentaire">اعثر على جرّاح أسنان قريب منك</a> واحجز موعدك عبر الإنترنت. وفي حال حمّى أو تورّم في الوجه أو الرقبة أو صعوبة في التنفّس أو البلع، اتّصل فورًا بالرقم 141 (SAMU) أو 15.</p>', 'الخُراج السنّي: العلامات والاستعجال والعلاج | المغرب', 'الخُراج السنّي: التعرّف على العلامات، معرفة متى يكون استعجالًا، ما يخفّف دون تفاقم، والعلاج الحقيقي عند طبيب الأسنان. دليل ملائم للمغرب.', 'الخُراج السنّي عدوى بقيح: لا يُشفى أبدًا من تلقاء نفسه.
العلاج هو التصريف عند طبيب الأسنان؛ والمضادّ الحيوي مكمّل فقط، وغير ضروري أحيانًا.
ألم يزول + طعم سيّئ = خُراج تصرّف جزئيًّا، لا شفاء.
استعجال (141 SAMU أو 15) عند تورّم العين أو الرقبة أو أرضية الفم، أو حمّى، أو صعوبة في التنفّس أو البلع أو فتح الفم.
لا حرارة أبدًا على الوجنة، ولا مضادّ حيوي مُعاد من وصفة قديمة.', '[{"q":"هل يمكن أن يُشفى الخُراج السنّي وحده؟","a":"لا. القيح محصور في حيّز لا يتصرّف تلقائيًّا. وقد يتوقّف الألم، خاصة إذا تصرّف الخُراج جزئيًّا عبر ناسور أو مات العصب، لكن العدوى تتابع تطوّرها في العظم. وعمل سنّي وحده — تصريف، معالجة قناة، أو قلع — هو ما يُنهي هذه العملية."},{"q":"كم يمكن الانتظار مع خُراج سنّي؟","a":"في غياب علامة إنذار، الهدف هو استشارة في اليوم نفسه أو الموالي. أما في حال تورّم الوجه أو الرقبة، أو حمّى، أو صعوبة في التنفّس أو البلع أو فتح الفم، فلا يجوز الانتظار مطلقًا: هذه مستعجلات، بالاتّصال بالرقم 141 (SAMU) أو 15."},{"q":"هل يحتاج الخُراج السنّي إلى مضادات حيوية؟","a":"ليس بشكل منهجي. العلاج الفعّال هو العمل الموضعي الذي يُنجزه طبيب الأسنان. وتُوصف المضادات الحيوية مكمّلة في حالات معيّنة — عدوى منتشرة، حمّى، أرضية هشّة — ولا تُوصف أبدًا بديلًا عن العلاج. فمضادّ حيوي بمفرده يُخفّف مؤقّتًا ثم يترك العدوى تعود."},{"q":"هل يمكن ثقب الخُراج السنّي بنفسي؟","a":"لا. الثقب أو الضغط يُعرّض لانتشار العدوى في أنسجة الوجه والرقبة العميقة وللخمج الإضافي. والتصريف عمل يُنجَز تحت التخدير بأدوات معقّمة، متبوعًا بمعالجة السبب."},{"q":"حرارة أم برودة على الوجنة في حالة الخُراج؟","a":"برودة، فوق قطعة قماش، لخمس عشرة دقيقة كحدّ أقصى. الحرارة تُسهّل انتشار العدوى في الأنسجة: لا كمّادة ساخنة، ولا قِربة ماء حارّ، ولا مضمضة شديدة السخونة."},{"q":"هل الخُراج السنّي معدٍ؟","a":"الخُراج بذاته لا يُنتقل. أما جراثيم الفم فتُتبادَل عبر اللعاب، لكن حالة أسنان كل شخص ولثته هي ما يحدّد خطر العدوى. ولا موجب لعزل الشخص المعني."},{"q":"هل يمكن لسنّ مسحوب العصب أن يُحدث خُراجًا مرّة أخرى؟","a":"نعم. إذا بقيت جراثيم في القنوات أو عادت إليها، أو إذا تدهورت إحكامية الحشو، فقد تظهر عدوى مجدّدًا عند قمة الجذر، وأحيانًا بعد سنوات. ويقوم العلاج حينها على إعادة معالجة القناة، أو اللجوء إلى عمل جراحي."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- dent-de-sagesse-extraction-maroc  (satellite du pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdcmnkr0001bgnpabxjno1d', 'Dent de sagesse : faut-il l''enlever et comment se passe l''extraction ?', 'dent-de-sagesse-extraction-maroc', 'Dent de sagesse : quand l''extraction est réellement justifiée, quand une simple surveillance suffit, comment se déroule le geste, à quoi ressemblent les jours d''après et quand rappeler le praticien.', '<p>« Il faut les enlever toutes les quatre. » Beaucoup de jeunes adultes entendent cette phrase sans savoir sur quoi elle repose. La réponse honnête est plus nuancée : une dent de sagesse qui a fait sa place et ne gêne personne peut rester en bouche sous surveillance. Une dent incluse qui s''infecte, abîme la dent voisine ou empêche un traitement, elle, doit partir.</p>

<p>Cet article explique ce qui distingue les deux situations, comment se déroule réellement l''extraction, à quoi ressemblent les jours qui suivent, et quand il faut rappeler le praticien. Il complète notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> et notre fiche <a href="/symptomes/dent-de-sagesse">dent de sagesse</a>.</p>

<h2>Ce que sont les dents de sagesse</h2>

<p>Ce sont les troisièmes molaires, les dernières à apparaître — le plus souvent entre 17 et 25 ans, parfois jamais. Elles sont au nombre de quatre, mais il n''est ni rare d''en avoir moins, ni anormal de n''en avoir aucune. Leur problème est mécanique : elles arrivent en dernier, dans une mâchoire dont la place est déjà prise. Quand l''espace manque, la dent reste bloquée dans l''os (dent incluse), sort de travers, ou n''émerge que partiellement.</p>

<h2>Quand faut-il l''enlever ?</h2>

<h3>Les situations qui justifient l''extraction</h3>

<ul>
<li><strong>Infections répétées de la gencive</strong> qui recouvre la dent (péricoronarite) : douleur au fond de la mâchoire, gencive gonflée, mauvais goût, parfois difficulté à ouvrir la bouche.</li>
<li><strong>Carie de la dent de sagesse ou de la dent voisine</strong> : la zone est presque impossible à brosser, et la deuxième molaire — une dent utile, elle — se carie au contact.</li>
<li><strong>Poussée qui abîme le voisinage</strong> : résorption de la racine d''à côté, perte d''os entre les deux dents.</li>
<li><strong>Kyste ou lésion</strong> autour de la dent incluse, visible sur la radio.</li>
<li><strong>Traitement d''orthodontie</strong> ou chirurgie des mâchoires quand la dent gêne le plan de traitement.</li>
<li><strong>Dent qui blesse la joue ou la langue</strong> de façon répétée.</li>
</ul>

<h3>Les situations de simple surveillance</h3>

<p>Une dent de sagesse complètement sortie, bien positionnée, brossable, sans carie et sans épisode infectieux n''a pas de raison d''être extraite « au cas où ». Une dent incluse profondément, silencieuse et sans lésion visible peut également être surveillée. La règle est celle du bénéfice : on n''opère pas une dent qui ne pose pas de problème et n''en annonce pas.</p>

<blockquote>À retenir sur le calendrier : quand l''extraction est indiquée, il est généralement plus confortable de l''envisager jeune. Les racines sont moins formées, l''os plus souple, la cicatrisation plus rapide. Ce n''est pas un argument pour extraire sans indication, mais pour ne pas repousser indéfiniment une extraction déjà justifiée.</blockquote>

<h2>Le bilan avant l''extraction</h2>

<p>L''examen clinique ne suffit pas pour une dent qu''on ne voit pas. Une <strong>radiographie panoramique</strong> montre la position de la dent, la forme de ses racines et leur rapport avec les structures voisines : le nerf du menton en bas, le sinus en haut. Quand ce rapport est étroit, un examen tridimensionnel (cone beam) peut être demandé. C''est ce bilan qui détermine si le geste relève du cabinet dentaire ou d''un chirurgien maxillo-facial, et sous quelle anesthésie.</p>

<p>Signalez systématiquement : vos traitements en cours — en particulier <a href="/blog/anticoagulants-maroc">anticoagulants</a> et antiagrégants, qu''il ne faut jamais arrêter de sa propre initiative —, un <a href="/blog/diabete-type-2-maroc">diabète</a>, une grossesse, une cardiopathie, une immunodépression, une allergie médicamenteuse.</p>

<h3>Si on ne l''enlève pas : ce qu''il faut surveiller</h3>

<p>Conserver une dent de sagesse n''est pas une décision qu''on prend une fois pour toutes. Une dent gardée sous surveillance se contrôle : radio de référence, puis vérification à chaque visite annuelle. Trois évolutions font rediscuter l''indication — l''apparition d''une <a href="/maladies/carie-dentaire">carie</a> sur la dent ou sur la deuxième molaire voisine, des épisodes infectieux qui se répètent, et une perte d''os entre les deux dents, qui relève de la <a href="/blog/parodontite-dechaussement-dents-maroc">maladie parodontale</a>. Un <a href="/blog/abces-dentaire-maroc">abcès</a> qui part d''une dent de sagesse tranche généralement la question.</p>

<h2>Arrêt de travail, coût et prise en charge</h2>

<p>Sur le plan pratique, deux points reviennent systématiquement en consultation. Le premier est l''organisation : prévoyez la fin de semaine plutôt que la veille d''un examen ou d''un déplacement, un accompagnant si une sédation est prévue, et de quoi vous alimenter facilement à la maison. Le second est le coût : il dépend du nombre de dents, de la difficulté du geste (dent sortie ou incluse dans l''os), du type d''anesthésie et du cadre — cabinet ou bloc opératoire. Demandez un <strong>devis écrit</strong> avant l''intervention, et une prise en charge préalable si elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge, calculé sur la tarification nationale de référence et non sur le montant facturé.</p>

<h2>Comment se passe l''extraction</h2>

<p>Le plus souvent, tout se fait au cabinet sous <strong>anesthésie locale</strong> : la zone est insensibilisée, vous restez éveillé et ne ressentez pas de douleur, seulement des pressions. Une sédation ou une anesthésie générale est réservée aux extractions multiples ou complexes et à l''anxiété majeure — voir la question <a href="/questions/j-ai-peur-de-l-anesthesie-generale-est-ce-vraiment-risque">j''ai peur de l''anesthésie générale</a>.</p>

<p>Le praticien dégage la gencive si elle recouvre la dent, élargit l''alvéole, et retire la dent — entière, ou en plusieurs fragments pour préserver l''os. Quelques points de suture referment le site, souvent résorbables. Le geste lui-même dure généralement moins de trois quarts d''heure. Pour une intervention programmée, notre question <a href="/questions/comment-bien-preparer-une-operation-programmee-a-jeun">comment préparer une opération</a> détaille les consignes de jeûne et d''accompagnement.</p>

<h2>Les jours d''après</h2>

<p>Il faut s''attendre à un gonflement de la joue et à une gêne pendant plusieurs jours, avec un maximum vers 48 à 72 heures, parfois un bleu et une raideur de la mâchoire. Beaucoup reprennent leurs activités dès le lendemain ; une extraction complexe justifie un à trois jours de repos.</p>

<h3>Ce qui aide vraiment</h3>

<ul>
<li><strong>Le froid</strong> sur la joue les premières vingt-quatre heures, par périodes courtes.</li>
<li><strong>Les antalgiques prescrits</strong>, pris régulièrement le premier jour plutôt qu''à la demande.</li>
<li><strong>Alimentation molle et tiède</strong>, boissons sans paille, pas d''alcool.</li>
<li><strong>Pas de tabac ni de chicha</strong> : le tabac est le premier facteur d''échec de cicatrisation.</li>
<li><strong>Brossage doux</strong> des autres dents dès le premier jour, rinçages selon les consignes du praticien — jamais de bain de bouche vigoureux les premières heures, qui déloge le caillot.</li>
<li><strong>Pas de sport intense</strong> ni d''effort les deux à trois premiers jours.</li>
</ul>

<h3>Manger et se laver les dents, jour par jour</h3>

<p><strong>Les premières heures</strong>, tant que l''anesthésie n''est pas dissipée, ne mangez pas : le risque est de se mordre la joue ou la lèvre sans le sentir. <strong>Le premier jour</strong>, alimentation froide ou tiède et molle — soupe tiède, yaourt, purée, œufs brouillés — sans paille et sans aliments à petits grains ou à éclats qui se logent dans l''alvéole. <strong>À partir du deuxième jour</strong>, on réintroduit progressivement en mastiquant du côté opposé, et on suit les consignes de rinçage données par le praticien. <strong>Au bout d''une semaine</strong>, la plupart des personnes ont retrouvé une alimentation normale.</p>

<p>Le brossage des autres dents reprend dès le soir même, avec une brosse souple ; on contourne simplement le site opératoire les premiers jours pour ne pas déloger le caillot, qui est le pansement naturel de la plaie. Les antalgiques et, si le praticien en a prescrit, l''<a href="/blog/antibiotiques-maroc">antibiotique</a> se prennent aux horaires indiqués et jusqu''au bout — la fiche des spécialités vendues au Maroc est dans notre <a href="/medicaments">base des médicaments</a>.</p>

<h3>Les signes qui doivent faire rappeler</h3>

<ul>
<li>Douleur qui <strong>augmente</strong> au troisième ou quatrième jour au lieu de diminuer, souvent avec une mauvaise odeur : c''est le tableau de l''alvéolite, quand le caillot ne tient pas. Cela se traite.</li>
<li>Saignement qui ne s''arrête pas malgré une compression prolongée.</li>
<li>Fièvre, gonflement qui progresse au-delà du troisième jour, difficulté à avaler ou à respirer : urgence, <strong>141 (SAMU) ou le 15</strong>.</li>
<li>Engourdissement persistant de la lèvre, du menton ou de la langue au-delà de quelques heures.</li>
</ul>

<h2>Questions fréquentes de terrain</h2>

<p><strong>Les quatre en une fois ?</strong> C''est possible et parfois plus pratique, notamment sous sédation, mais le confort post-opératoire est moindre. Beaucoup de praticiens procèdent côté par côté pour laisser un côté fonctionnel.</p>

<p><strong>Les dents de sagesse déplacent-elles les dents de devant ?</strong> Cette idée est très répandue mais mal étayée : la récidive orthodontique s''explique surtout par la stabilité du résultat et le port de la contention. C''est l''orthodontiste qui juge, en fonction du plan de traitement — voir aussi <a href="/symptomes/dents-mal-alignees">dents mal alignées</a>.</p>

<p><strong>Et pendant la grossesse ?</strong> Une extraction non urgente se reporte après l''accouchement ; une infection, elle, se traite. Le deuxième trimestre est la période la plus confortable pour un geste nécessaire. Voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</p>

<h2>En résumé</h2>

<p>La bonne question n''est pas « faut-il enlever les dents de sagesse ? » mais « <em>cette</em> dent, chez <em>cette</em> personne, pose-t-elle ou annonce-t-elle un problème ? ». Une radio, un examen et un avis argumenté permettent de trancher. En cas de doute, demandez au praticien de vous montrer la radio et de vous expliquer l''indication : c''est la meilleure façon d''éviter autant l''extraction inutile que l''attente qui coûte une deuxième molaire.</p>

<hr>

<p>Une douleur au fond de la mâchoire ou un avis à confirmer ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, comparez les profils vérifiés et prenez rendez-vous en ligne. En cas de fièvre avec gonflement ou de difficulté à avaler, appelez le 141 (SAMU) ou le 15.</p>', '/blog-covers/post-dent-de-sagesse-extraction-maroc.jpg', 'Radiographie panoramique dentaire montrant les dents de sagesse', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 8, 'Dent de sagesse : faut-il l''extraire ?', 'Dent de sagesse : quand l''extraction est justifiée, déroulé du geste, récupération, alvéolite et cas particuliers. Guide clair adapté au Maroc.', 'Une dent de sagesse bien sortie, brossable et indolore peut rester : on n''extrait pas « au cas où ».
L''extraction est justifiée en cas d''infections répétées, de carie, d''atteinte de la dent voisine, de kyste ou de gêne orthodontique.
La radiographie panoramique conditionne la décision et le choix de l''anesthésie.
Gonflement et gêne sont normaux jusqu''à 72 h ; une douleur qui augmente au 3e jour évoque une alvéolite, à traiter.
Tabac et chicha sont le premier facteur d''échec de cicatrisation après extraction.', '[{"q":"Faut-il toujours enlever les dents de sagesse ?","a":"Non. Une dent de sagesse complètement sortie, bien positionnée, accessible au brossage et sans épisode infectieux peut être conservée sous surveillance. L''extraction s''impose en cas d''infections répétées, de carie de la dent ou de sa voisine, d''atteinte de l''os, de kyste, ou lorsqu''elle gêne un traitement d''orthodontie."},{"q":"À quel âge faut-il extraire une dent de sagesse ?","a":"Il n''y a pas d''âge obligatoire. Quand l''extraction est indiquée, elle est généralement plus simple et la cicatrisation plus rapide chez le jeune adulte, car les racines sont moins formées. Cela ne justifie pas d''extraire une dent qui ne pose aucun problème."},{"q":"L''extraction d''une dent de sagesse est-elle douloureuse ?","a":"Le geste se fait sous anesthésie : on ressent des pressions, pas de douleur. C''est ensuite qu''il faut compter une gêne et un gonflement, maximum vers 48 à 72 heures, contrôlés par les antalgiques prescrits et le froid sur la joue."},{"q":"Combien de temps dure la récupération ?","a":"La plupart des personnes reprennent leurs activités dès le lendemain, avec un gonflement qui décroît sur cinq à sept jours. Une extraction complexe peut demander un à trois jours de repos. Une douleur qui augmente au troisième ou quatrième jour n''est pas normale et doit faire rappeler le praticien."},{"q":"Peut-on enlever les quatre dents de sagesse en une seule fois ?","a":"C''est possible, notamment sous sédation ou anesthésie générale, mais les suites sont plus inconfortables puisqu''aucun côté ne reste fonctionnel. Beaucoup de praticiens préfèrent opérer côté par côté ; la décision se prend avec vous selon la difficulté et votre situation."},{"q":"Qu''est-ce qu''une alvéolite après extraction ?","a":"C''est la complication la plus fréquente : le caillot qui protège l''alvéole se désagrège ou ne se forme pas, laissant l''os à nu. Le signe typique est une douleur intense qui réapparaît ou s''aggrave au troisième ou quatrième jour, souvent avec une mauvaise odeur. Cela se soigne au cabinet, il ne faut pas attendre."},{"q":"Les dents de sagesse font-elles bouger les autres dents ?","a":"Cette idée est répandue mais peu étayée scientifiquement. La récidive après un traitement d''orthodontie dépend surtout de la stabilité du résultat et du port de la contention. C''est l''orthodontiste, avec le chirurgien-dentiste, qui juge si une extraction sert le plan de traitement."},{"q":"Peut-on fumer après une extraction dentaire ?","a":"Il faut l''éviter, cigarette comme chicha. Le tabac est le premier facteur d''échec de cicatrisation : il perturbe le caillot, favorise l''alvéolite et l''infection. Plus l''abstinence couvre les premiers jours, meilleures sont les suites."}]', '[{"label":"Wisdom tooth removal — indications, procédure, suites","url":"https://www.nhs.uk/conditions/wisdom-tooth-removal/","publisher":"National Health Service (NHS)"},{"label":"Douleurs au niveau des dents et de la bouche : quelles causes ?","url":"https://www.ameli.fr/assure/sante/themes/douleurs-dentaires-bouche/causes-douleurs","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Prescription des antibiotiques en pratique bucco-dentaire — recommandations","url":"https://ansm.sante.fr/uploads/2021/02/04/reco-prescription-des-antibiotiques-en-pratique-buccodentaire-septembre2011.pdf","publisher":"ANSM","year":"2011"},{"label":"Santé bucco-dentaire — principaux repères","url":"https://www.who.int/fr/news-room/fact-sheets/detail/oral-health","publisher":"Organisation mondiale de la Santé (OMS)","year":"2025"}]', 'Dent de sagesse', (SELECT id FROM posts WHERE slug = 'mal-de-dents-rage-de-dents-maroc'), 'ضرس العقل: هل يجب قلعه وكيف يجري القلع؟', 'ضرس العقل: متى يكون القلع مبرّرًا فعلًا، ومتى تكفي المراقبة، وكيف يجري العمل، وكيف تكون الأيام التالية، ومتى يجب الاتّصال بالممارس.', '<p>«يجب قلعها كلّها، الأربعة.» يسمع كثير من الشباب هذه العبارة دون أن يعرفوا على أيّ أساس تقوم. والجواب الصادق أكثر تفصيلًا: ضرس عقل وجد مكانه ولا يُزعج أحدًا يمكن أن يبقى في الفم تحت المراقبة. أما ضرس منطمر يُخمج، أو يُتلف السنّ المجاور، أو يعيق علاجًا، فيجب قلعه.</p>

<p>يشرح هذا المقال ما يفرّق بين الحالتين، وكيف يجري القلع فعلًا، وكيف تكون الأيام التالية، ومتى يجب الاتّصال بالممارس. وهو يكمّل دليلنا <a href="/blog/mal-de-dents-rage-de-dents-maroc">ألم الأسنان</a> وبطاقتنا <a href="/symptomes/dent-de-sagesse">ضرس العقل</a>.</p>

<h2>ما هي أضراس العقل</h2>

<p>هي الأرحاء الثالثة، آخر ما يظهر من الأسنان — غالبًا بين 17 و25 سنة، وأحيانًا أبدًا. وعددها أربعة، لكن ليس نادرًا أن يكون أقلّ، ولا شاذًّا ألّا يوجد أيّ منها. ومشكلتها ميكانيكية: تأتي في الأخير، في فكّ استُغلّ مكانه سابقًا. وعندما ينقص الحيّز، يبقى الضرس محصورًا في العظم (ضرس منطمر)، أو يبزغ مائلًا، أو لا يظهر إلا جزئيًّا.</p>

<h2>متى يجب قلعه؟</h2>

<h3>الحالات التي تبرّر القلع</h3>

<ul>
<li><strong>عدوى متكرّرة في اللثة</strong> التي تغطّي الضرس (التهاب ما حول التاج): ألم في عمق الفكّ، لثة متورّمة، طعم سيّئ، وأحيانًا صعوبة في فتح الفم.</li>
<li><strong>تسوّس ضرس العقل أو السنّ المجاور</strong>: المنطقة شبه مستحيلة التفريش، والرحى الثانية — وهي سنّ نافع — تتسوّس عند نقطة التلامس.</li>
<li><strong>بزوغ يُتلف الجوار</strong>: انحلال جذر السنّ المجاور، فقد عظم بين السنّين.</li>
<li><strong>كيس أو إصابة</strong> حول الضرس المنطمر، ظاهرة في الصورة الشعاعية.</li>
<li><strong>علاج تقويم الأسنان</strong> أو جراحة الفكّين إذا كان الضرس يعيق خطّة العلاج.</li>
<li><strong>ضرس يجرح الوجنة أو اللسان</strong> بشكل متكرّر.</li>
</ul>

<h3>حالات المراقبة البسيطة</h3>

<p>ضرس عقل بزغ كاملًا، في موضع سليم، قابل للتفريش، بلا تسوّس وبلا نوبة خمجية، لا سبب لقلعه «تحسّبًا». كذلك يمكن مراقبة ضرس منطمر بعمق، صامت وبلا إصابة ظاهرة. والقاعدة هي قاعدة الفائدة: لا نُجري عملية لضرس لا يطرح مشكلة ولا يُنذر بها.</p>

<blockquote>ملاحظة عن التوقيت: عندما يكون القلع مُستطبًّا، يكون التفكير فيه في سنّ مبكّرة أكثر راحة عمومًا. فالجذور أقلّ تشكّلًا، والعظم أكثر مرونة، والشفاء أسرع. وهذه ليست حجّة للقلع دون استطباب، بل لعدم تأجيل قلع مبرّر أصلًا إلى ما لا نهاية.</blockquote>

<h2>الفحص قبل القلع</h2>

<p>الفحص السريري لا يكفي لضرس لا نراه. فـ<strong>الصورة الشعاعية البانورامية</strong> تُظهر موضع الضرس وشكل جذوره وعلاقتها بالبنيات المجاورة: عصب الذقن في الأسفل، والجيب الفكّي في الأعلى. وعندما تكون هذه العلاقة ضيّقة، قد يُطلب فحص ثلاثي الأبعاد (cone beam). وهذا الفحص هو ما يحدّد إن كان العمل من اختصاص عيادة الأسنان أو جرّاح الفم والوجه والفكّين، وتحت أيّ تخدير.</p>

<p>أبلِغ دائمًا عن: أدويتك الجارية — خاصة <a href="/blog/anticoagulants-maroc">مضادّات التخثّر</a> ومضادّات التصفيح، التي لا يجب إيقافها من تلقاء نفسك أبدًا — و<a href="/blog/diabete-type-2-maroc">السكري</a>، والحمل، ومرض قلبي، ونقص مناعة، وحساسية دوائية.</p>

<h3>إن لم يُقلَع: ما يجب مراقبته</h3>

<p>حفظ ضرس العقل ليس قرارًا يُتّخذ مرّة واحدة نهائيًّا. فالضرس المحفوظ تحت المراقبة يُفحَص: صورة مرجعية، ثم تحقّق في كل زيارة سنوية. وثلاثة تطوّرات تُعيد فتح مسألة القلع — ظهور <a href="/maladies/carie-dentaire">تسوّس</a> على الضرس أو على الرحى الثانية المجاورة، ونوبات خمجية متكرّرة، وفقد عظم بين السنّين وهو ما يخصّ <a href="/blog/parodontite-dechaussement-dents-maroc">مرض دواعم السن</a>. أما <a href="/blog/abces-dentaire-maroc">خُراج</a> ينطلق من ضرس عقل فيحسم المسألة عمومًا.</p>

<h2>عطلة العمل، الكلفة والتغطية</h2>

<p>من الناحية العملية، تتكرّر نقطتان في الاستشارة. الأولى هي التنظيم: خطّط لنهاية الأسبوع بدلًا من عشيّة امتحان أو سفر، ورافقك أحد إن كان تركين مبرمجًا، ووفّر ما تتغذّى به بسهولة في البيت. والثانية هي الكلفة: تتوقّف على عدد الأضراس، وصعوبة العمل (ضرس بازغ أو منطمر في العظم)، ونوع التخدير، والإطار — عيادة أو غرفة عمليات. اطلب <strong>تسعيرًا مكتوبًا</strong> قبل العملية، وموافقة مسبقة إن كانت مطلوبة. وتُفصّل صفحتانا <a href="/prix">أسعار الأعمال الطبية</a> و<a href="/remboursement-amo-cnss">التعويض AMO / CNSS</a> آلية الباقي على عاتقك، المحسوب على أساس التسعير الوطني المرجعي لا على المبلغ المفوتَر.</p>

<h2>كيف يجري القلع</h2>

<p>في الغالب، يجري كل شيء في العيادة تحت <strong>تخدير موضعي</strong>: تُخدّر المنطقة، وتبقى مستيقظًا ولا تحسّ بألم، بل بضغوط فقط. ويُحتفظ بالتركين أو التخدير العام للقلع المتعدّد أو المعقّد وللقلق الشديد — انظر سؤال <a href="/questions/j-ai-peur-de-l-anesthesie-generale-est-ce-vraiment-risque">أخاف من التخدير العام</a>.</p>

<p>يُحرّر الممارس اللثة إن كانت تغطّي الضرس، ويوسّع السنخ، ثم يُخرج الضرس — كاملًا أو مقسّمًا إلى عدّة أجزاء للحفاظ على العظم. وتُغلَق المنطقة ببعض الخيوط الجراحية، القابلة للامتصاص غالبًا. ويدوم العمل نفسه أقلّ من ثلاثة أرباع الساعة عمومًا. وللعملية المبرمجة، يُفصّل سؤالنا <a href="/questions/comment-bien-preparer-une-operation-programmee-a-jeun">كيف نُحضّر لعملية</a> تعليمات الصيام والمرافقة.</p>

<h2>الأيام التالية</h2>

<p>يجب توقّع تورّم في الوجنة وانزعاج لعدّة أيام، بأقصى شدّة نحو 48 إلى 72 ساعة، وأحيانًا زرقة وتيبّس في الفكّ. ويستأنف كثيرون أنشطتهم من الغد؛ أما القلع المعقّد فيبرّر راحة يوم إلى ثلاثة أيام.</p>

<h3>ما يساعد فعلًا</h3>

<ul>
<li><strong>البرودة</strong> على الوجنة في الأربع والعشرين ساعة الأولى، بفترات قصيرة.</li>
<li><strong>المسكّنات الموصوفة</strong>، تُؤخذ بانتظام في اليوم الأول بدلًا من عند الحاجة.</li>
<li><strong>تغذية طرية وفاترة</strong>، شرب دون قصبة، ولا كحول.</li>
<li><strong>لا تبغ ولا شيشة</strong>: التبغ هو العامل الأول لفشل الشفاء.</li>
<li><strong>تفريش لطيف</strong> للأسنان الأخرى من اليوم الأول، ومضمضة حسب تعليمات الممارس — دون مضمضة قوية في الساعات الأولى، فهي تُزيح الخُثرة.</li>
<li><strong>لا رياضة عنيفة</strong> ولا مجهود في اليومين أو الثلاثة الأولى.</li>
</ul>

<h3>الأكل وتنظيف الأسنان، يومًا بيوم</h3>

<p><strong>في الساعات الأولى</strong>، وما دام أثر التخدير باقيًا، لا تأكل: فالخطر هو عضّ الوجنة أو الشفة دون الإحساس بذلك. <strong>في اليوم الأول</strong>، تغذية باردة أو فاترة وطرية — شوربة فاترة، لبن، بطاطس مهروسة، بيض مخفوق — دون قصبة ودون أطعمة ذات حبيبات صغيرة أو شُظايا تعلق في السنخ. <strong>من اليوم الثاني</strong>، نُعيد الإدخال تدريجيًّا مع المضغ من الجهة المعاكسة، ونتبع تعليمات المضمضة. <strong>وبعد أسبوع</strong>، يستعيد معظم الناس تغذية عادية.</p>

<p>ويُستأنف تفريش الأسنان الأخرى في المساء نفسه، بفرشاة ناعمة؛ ونتجنّب فقط منطقة العمل في الأيام الأولى حتى لا نُزيح الخُثرة، وهي الضمادة الطبيعية للجرح. وتُؤخذ المسكّنات، و<a href="/blog/antibiotiques-maroc">المضادّ الحيوي</a> إن وصفه الممارس، في المواعيد المحدّدة وإلى النهاية — وبطاقات الأدوية المسوّقة في المغرب في <a href="/medicaments">قاعدة الأدوية</a> عندنا.</p>

<h3>العلامات التي تفرض الاتّصال</h3>

<ul>
<li>ألم <strong>يتزايد</strong> في اليوم الثالث أو الرابع بدلًا من أن ينقص، مع رائحة كريهة غالبًا: هذه صورة التهاب السنخ، حين لا تصمد الخُثرة. وهو قابل للعلاج.</li>
<li>نزف لا يتوقّف رغم ضغط مطوّل.</li>
<li>حمّى، تورّم يتقدّم بعد اليوم الثالث، صعوبة في البلع أو التنفّس: استعجال، <strong>141 (SAMU) أو 15</strong>.</li>
<li>تخدير مستمرّ في الشفة أو الذقن أو اللسان بعد بضع ساعات.</li>
</ul>

<h2>أسئلة ميدانية متكرّرة</h2>

<p><strong>الأربعة في مرّة واحدة؟</strong> ممكن وأحيانًا أكثر عمليةً، خاصة تحت التركين، لكن الراحة بعد العمل تكون أقلّ. ويفضّل كثير من الممارسين العمل جهةً بجهة لترك جانب صالح للمضغ.</p>

<p><strong>هل تُزحزح أضراس العقل الأسنان الأمامية؟</strong> هذه الفكرة شائعة جدًّا لكنها ضعيفة الإسناد: فنكس نتيجة تقويم الأسنان يُفسَّر أساسًا باستقرار النتيجة وبحمل جهاز التثبيت. وأخصّائي التقويم هو من يحكم، حسب خطّة العلاج — انظر أيضًا <a href="/symptomes/dents-mal-alignees">الأسنان غير المصطفّة</a>.</p>

<p><strong>وخلال الحمل؟</strong> يُؤجَّل قلع غير مستعجل إلى ما بعد الولادة؛ أما العدوى فتُعالَج. والثلث الثاني هو الفترة الأكثر راحة لعمل ضروري. انظري <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>.</p>

<h2>الخلاصة</h2>

<p>السؤال الصحيح ليس «هل يجب قلع أضراس العقل؟» بل «هل <em>هذا</em> الضرس، عند <em>هذا</em> الشخص، يطرح مشكلة أو يُنذر بها؟». وتسمح صورة شعاعية وفحص ورأي مُعلَّل بالحكم. وعند الشكّ، اطلب من الممارس أن يُريك الصورة ويشرح لك الاستطباب: فهذه أفضل طريقة لتفادي القلع غير الضروري بقدر ما تفادي الانتظار الذي يُفقد رحى ثانية.</p>

<hr>

<p>ألم في عمق الفكّ أو رأي تريد تأكيده؟ على SantéauMaroc، <a href="/specialites/chirurgie-dentaire">اعثر على جرّاح أسنان قريب منك</a>، وقارن الملفات المتحقَّق منها، واحجز موعدك عبر الإنترنت. وفي حال حمّى مع تورّم أو صعوبة في البلع، اتّصل بالرقم 141 (SAMU) أو 15.</p>', 'ضرس العقل: هل يجب قلعه؟ | المغرب', 'ضرس العقل: استطبابات القلع الحقيقية، الفحص الشعاعي، مجرى العمل، الشفاء، التهاب السنخ والحالات الخاصة. دليل واضح ملائم للمغرب.', 'ضرس عقل بزغ جيّدًا، قابل للتفريش وغير مؤلم يمكن أن يبقى: لا نقلع «تحسّبًا».
القلع مبرّر عند تكرار العدوى، أو التسوّس، أو إصابة السنّ المجاور، أو كيس، أو إعاقة لعلاج التقويم.
الصورة الشعاعية البانورامية تحدّد القرار واختيار التخدير.
التورّم والانزعاج طبيعيان حتى 72 ساعة؛ أما ألم يتزايد في اليوم الثالث فيُوجّه إلى التهاب السنخ، وهو قابل للعلاج.
التبغ والشيشة هما العامل الأول لفشل الشفاء بعد القلع.', '[{"q":"هل يجب دائمًا قلع أضراس العقل؟","a":"لا. ضرس عقل بزغ كاملًا، في موضع سليم، يمكن الوصول إليه بالفرشاة وبلا نوبة خمجية يمكن حفظه تحت المراقبة. ويكون القلع لازمًا عند تكرار العدوى، أو تسوّس الضرس أو السنّ المجاور، أو إصابة العظم، أو كيس، أو عندما يعيق علاج تقويم الأسنان."},{"q":"في أيّ سنّ يجب قلع ضرس العقل؟","a":"لا يوجد سنّ إلزامية. وعندما يكون القلع مُستطبًّا، يكون عمومًا أبسط والشفاء أسرع عند الشابّ، لأن الجذور أقلّ تشكّلًا. وهذا لا يبرّر قلع ضرس لا يطرح أيّ مشكلة."},{"q":"هل قلع ضرس العقل مؤلم؟","a":"يُنجَز العمل تحت تخدير: نحسّ بضغوط لا بألم. أما بعده فيجب توقّع انزعاج وتورّم، بأقصى شدّة نحو 48 إلى 72 ساعة، يُضبَطان بالمسكّنات الموصوفة وبالبرودة على الوجنة."},{"q":"كم يدوم الشفاء؟","a":"يستأنف معظم الناس أنشطتهم من الغد، مع تورّم يتراجع على مدى خمسة إلى سبعة أيام. وقد يستلزم قلع معقّد راحة يوم إلى ثلاثة أيام. أما ألم يتزايد في اليوم الثالث أو الرابع فليس طبيعيًّا ويجب أن يدفع إلى الاتّصال بالممارس."},{"q":"هل يمكن قلع أضراس العقل الأربعة في مرّة واحدة؟","a":"ممكن، خاصة تحت التركين أو التخدير العام، لكن ما بعد العمل يكون أقلّ راحة لأنه لا يبقى أيّ جانب صالح للمضغ. ويفضّل كثير من الممارسين العمل جهةً بجهة؛ ويُتّخذ القرار معك حسب الصعوبة وحالتك."},{"q":"ما هو التهاب السنخ بعد القلع؟","a":"هو أكثر المضاعفات شيوعًا: تتفكّك الخُثرة التي تحمي السنخ أو لا تتشكّل، فيبقى العظم مكشوفًا. والعلامة النمطية ألم شديد يظهر أو يتفاقم في اليوم الثالث أو الرابع، مع رائحة كريهة غالبًا. ويُعالَج في العيادة، فلا يجب الانتظار."},{"q":"هل تُحرّك أضراس العقل الأسنان الأخرى؟","a":"هذه الفكرة شائعة لكن إسنادها العلمي ضعيف. فالنكس بعد علاج تقويم الأسنان يتوقّف أساسًا على استقرار النتيجة وعلى حمل جهاز التثبيت. وأخصّائي التقويم، مع جرّاح الأسنان، هو من يحكم إن كان القلع يخدم خطّة العلاج."},{"q":"هل يمكن التدخين بعد قلع سنّ؟","a":"يجب تفاديه، سيجارة كانت أو شيشة. فالتبغ هو العامل الأول لفشل الشفاء: يُخلّ بالخُثرة، ويشجّع التهاب السنخ والعدوى. وكلّما شمل الامتناع الأيام الأولى، كانت العواقب أفضل."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- parodontite-dechaussement-dents-maroc  (satellite du pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdcmnkz0002bgnpsmtt2xpg', 'Parodontite : pourquoi les dents se déchaussent et comment l''arrêter', 'parodontite-dechaussement-dents-maroc', 'Parodontite : une infection silencieuse qui détruit l''os autour des dents. Les signes à repérer tôt, le lien avec le diabète, ce que le traitement récupère vraiment et ce qui relève de la fausse promesse.', '<p>Les dents ne tombent pas parce qu''elles vieillissent. Elles tombent parce que ce qui les tient — la gencive et l''os — a été détruit, lentement, par une infection qui ne fait presque pas mal. C''est toute la difficulté de la parodontite : elle avance sans douleur et se manifeste tard, quand la perte osseuse est déjà installée. L''OMS estime que les formes sévères de maladie parodontale touchent <strong>plus d''un milliard de personnes</strong> dans le monde.</p>

<p>Cet article explique comment repérer la maladie tôt, pourquoi elle dépasse le cadre de la bouche, ce que le traitement peut réellement récupérer, et ce qui relève au contraire de la fausse promesse. Il complète notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> et la fiche <a href="/maladies/gingivite">gingivite</a>.</p>

<h2>De la gingivite à la parodontite</h2>

<p>Tout commence par la plaque dentaire, un dépôt bactérien qui se minéralise en tartre. La gencive s''enflamme : c''est la <strong>gingivite</strong>, rouge, un peu gonflée, qui <a href="/symptomes/saignement-des-gencives">saigne au brossage</a>. À ce stade, tout est <strong>réversible</strong> : hygiène rigoureuse et détartrage suffisent le plus souvent.</p>

<p>Si l''inflammation persiste, elle passe sous la gencive. L''attache se décolle et forme une <strong>poche parodontale</strong>, un espace que la brosse n''atteint plus et où les bactéries prospèrent. L''os qui entoure la racine commence à fondre. C''est la <strong>parodontite</strong> — et cette perte d''os, contrairement à l''inflammation gingivale, <strong>ne se reconstitue pas spontanément</strong>. L''objectif du traitement devient alors d''arrêter la progression, pas de revenir en arrière.</p>

<table>
<thead>
<tr><th>Stade</th><th>Ce que l''on constate</th><th>Ce que le traitement peut obtenir</th></tr>
</thead>
<tbody>
<tr><td>Gencive saine</td><td>Rose pâle, ferme, aucun saignement au brossage</td><td>Maintien par l''hygiène et le contrôle annuel</td></tr>
<tr><td>Gingivite</td><td>Rougeur, gonflement, saignement au brossage, pas de perte d''os</td><td><strong>Retour complet à la normale</strong></td></tr>
<tr><td>Parodontite débutante</td><td>Poches peu profondes, début de perte osseuse à la radio</td><td>Arrêt de l''évolution, gencive raffermie</td></tr>
<tr><td>Parodontite modérée à sévère</td><td>Poches profondes, récessions, mobilités, espaces qui s''ouvrent</td><td>Stabilisation ; l''os perdu ne revient pas</td></tr>
</tbody>
</table>

<h2>Les signes à repérer tôt</h2>

<ul>
<li><strong>Saignement</strong> au brossage ou au fil dentaire — le premier signal, celui qu''on banalise le plus.</li>
<li>Gencives rouges, gonflées, sensibles au contact.</li>
<li><strong>Récession</strong> : les dents paraissent plus longues, les collets se dénudent, la sensibilité au froid augmente.</li>
<li><a href="/symptomes/mauvaise-haleine">Mauvaise haleine</a> persistante, goût désagréable.</li>
<li>Espaces qui apparaissent entre les dents, aliments qui s''y coincent.</li>
<li><strong>Mobilité</strong> dentaire, dents qui « bougent » ou dont la position change, gêne à la mastication.</li>
<li>Abcès de la gencive à répétition.</li>
</ul>

<blockquote>Un saignement de gencive n''est jamais normal, même minime, même indolore. C''est le signe le plus précoce et le plus utile ; c''est aussi celui qui laisse le plus de marge de manœuvre au traitement.</blockquote>

<h2>Pourquoi ce n''est pas qu''un problème de bouche</h2>

<p>La parodontite est une infection chronique qui entretient une inflammation à bas bruit dans tout l''organisme. Deux liens sont particulièrement documentés :</p>

<ul>
<li><strong>Le <a href="/blog/diabete-type-2-maroc">diabète</a></strong>, dans les deux sens : un diabète mal équilibré favorise et aggrave la parodontite ; une parodontite active rend le contrôle de la glycémie plus difficile. Traiter les gencives fait partie de la prise en charge du diabète, pas d''un confort annexe.</li>
<li><strong>Le risque cardiovasculaire</strong>, associé à l''inflammation chronique — un argument de plus, avec le tabac, pour ne pas laisser traîner. Voir notre article sur la <a href="/blog/prevention-cardiovasculaire-maroc">prévention cardiovasculaire</a>.</li>
</ul>

<p>Chez la femme enceinte, les gencives sont plus réactives sous l''effet hormonal et une gingivite s''installe facilement : les soins sont recommandés pendant la grossesse (voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>).</p>

<h2>Ce qui augmente le risque</h2>

<ul>
<li><strong>Le tabac et la chicha</strong> — facteur de risque majeur, qui masque en plus le saignement et donne une fausse impression de gencive saine. Voir <a href="/blog/arret-tabac-sevrage-maroc">arrêter de fumer</a>.</li>
<li>Un diabète déséquilibré, une immunodépression.</li>
<li>Une prédisposition familiale : les formes précoces et agressives existent, y compris chez le sujet jeune.</li>
<li>Le <a href="/maladies/bruxisme">bruxisme</a>, qui surcharge des dents déjà fragilisées.</li>
<li>Le tartre installé, des restaurations débordantes, des dents <a href="/symptomes/dents-mal-alignees">mal alignées</a> difficiles à nettoyer.</li>
<li>Certains médicaments, la respiration buccale, le stress.</li>
</ul>

<h3>Le piège du fumeur</h3>

<p>Le tabac resserre les vaisseaux de la gencive. Résultat : chez un fumeur, la gencive <strong>saigne moins</strong> alors que la maladie progresse davantage. Beaucoup de fumeurs se croient donc épargnés jusqu''au jour où une dent bouge. Si vous fumez, ne vous fiez pas à l''absence de saignement comme indicateur : c''est le sondage au cabinet qui dit la vérité, et le dépistage doit être plus régulier, pas moins.</p>

<p>Ce biais s''ajoute à une réalité marocaine : selon l''enquête nationale de santé bucco-dentaire, une part importante de la population n''a jamais consulté de dentiste, et le pays compte environ un dentiste pour 8 100 habitants. La maladie parodontale y est donc souvent découverte à un stade où l''os est déjà entamé — raison de plus pour transformer le premier saignement en rendez-vous.</p>

<h2>Comment le diagnostic se pose</h2>

<p>Le praticien réalise un <strong>bilan parodontal</strong> : il mesure, dent par dent, la profondeur des poches à la sonde, note les saignements, les récessions et les mobilités. Des <strong>radiographies</strong> objectivent la perte osseuse et servent de référence pour suivre l''évolution. C''est ce relevé — et non l''impression visuelle — qui permet de dire s''il s''agit d''une gingivite ou d''une parodontite, et à quel stade. Un <a href="/specialites/chirurgie-dentaire">chirurgien-dentiste</a> assure la prise en charge ; les formes avancées peuvent être adressées à un parodontologue.</p>

<h2>Le traitement : ce qui marche vraiment</h2>

<h3>1. L''assainissement non chirurgical</h3>

<p>C''est le socle, et il fonctionne. Détartrage complet, puis <strong>surfaçage radiculaire</strong> : un nettoyage en profondeur, sous la gencive, qui élimine le tartre et le tissu infecté à la surface des racines pour permettre à la gencive de se réattacher. L''intervention se fait sous anesthésie locale, en une ou plusieurs séances selon l''étendue. En parallèle, la <strong>technique de brossage</strong> et le nettoyage entre les dents sont revus — sans cela, le bénéfice ne tient pas.</p>

<h3>2. La chirurgie, si nécessaire</h3>

<p>Quand des poches profondes persistent après assainissement, un geste chirurgical permet d''accéder aux zones inaccessibles, de remodeler la gencive, et parfois de tenter une régénération osseuse dans des défauts bien délimités. C''est une option ciblée, pas une étape obligatoire.</p>

<h3>3. La maintenance, à vie</h3>

<p>C''est le point que les patients découvrent souvent trop tard : une parodontite traitée est une maladie <strong>stabilisée, pas guérie</strong>. Des visites de contrôle rapprochées, généralement tous les trois à six mois selon le risque, avec assainissement d''entretien, sont ce qui distingue une stabilisation durable d''une rechute. Voir <a href="/questions/mes-dents-se-dechaussent-parodontite-comment-arreter-la-progression">comment arrêter la progression d''une parodontite</a>.</p>

<h2>Récessions, sensibilité, dents perdues : les suites possibles</h2>

<p>Une fois la maladie stabilisée, il reste souvent à traiter ses traces. Les <strong>récessions</strong> — collets dénudés, dents visuellement plus longues — expliquent la sensibilité au froid et à la brosse ; des dentifrices adaptés, des vernis appliqués au cabinet et, dans certains cas, une greffe de gencive permettent d''améliorer confort et esthétique. Attention au réflexe inverse : brosser plus fort aggrave la récession.</p>

<p>Quand une ou plusieurs dents ont été perdues, le remplacement se discute <strong>après</strong> stabilisation, jamais avant : bridge, prothèse amovible ou <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>, selon le volume d''os restant et le contrôle de la maladie. C''est aussi à ce moment que le rôle du <a href="/blog/abces-dentaire-maroc">contrôle des foyers infectieux</a> devient décisif : un abcès parodontal négligé peut faire perdre en quelques mois l''os qu''on espérait utiliser.</p>

<h2>Ce qui ne marche pas</h2>

<ul>
<li><strong>Les bains de bouche seuls.</strong> Ils complètent parfois un traitement, sur une durée limitée et sur prescription ; ils ne pénètrent pas dans une poche et ne remplacent aucun geste mécanique. Utilisés au long cours sans avis, ils ont leurs propres inconvénients.</li>
<li><strong>Les antibiotiques seuls.</strong> Sans assainissement, ils n''ont pas d''effet durable. Voir <a href="/blog/antibiotiques-maroc">le bon usage des antibiotiques</a>.</li>
<li><strong>Brosser plus fort.</strong> Un brossage agressif abîme la gencive et accélère la récession. C''est la régularité et la technique qui comptent, pas la force.</li>
<li><strong>Attendre que la mobilité passe.</strong> Une dent mobile sur parodontite ne se resserre pas d''elle-même.</li>
<li><strong>Poser un implant sans traiter la maladie.</strong> Les tissus autour d''un implant peuvent s''infecter de la même façon : une parodontite non stabilisée compromet le résultat — voir <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant dentaire</a>.</li>
</ul>

<h2>La prévention, au quotidien</h2>

<ul>
<li><strong>Deux brossages par jour, deux minutes</strong>, brosse souple, dentifrice fluoré, en insistant à la jonction dent-gencive.</li>
<li><strong>Un nettoyage interdentaire quotidien</strong> — fil ou brossettes, choisies avec le praticien selon les espaces. C''est l''ajout qui change le plus les choses.</li>
<li><strong>Détartrage régulier</strong> et contrôle une à deux fois par an : voir <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">à quelle fréquence</a> et <a href="/prevenir/gingivite">prévenir la maladie des gencives</a>.</li>
<li><strong>Arrêter le tabac et la chicha</strong> : c''est, avec l''hygiène, le levier le plus puissant.</li>
<li><strong>Équilibrer un diabète</strong> et signaler tout traitement au long cours.</li>
<li><strong>Consulter dès le premier saignement</strong>, sans attendre la mobilité.</li>
</ul>

<p>Sur le plan financier, la logique est la même que pour la carie : un détartrage et un assainissement précoces coûtent bien moins qu''un traitement de parodontite avancée suivi de remplacements prothétiques. Nos pages <a href="/prix">tarifs des actes</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge.</p>

<h2>En résumé</h2>

<p>La parodontite est une maladie silencieuse, fréquente et traitable, dont le pronostic dépend presque entièrement du moment où on la prend. Un saignement de gencive est une invitation à consulter, pas un détail d''hygiène. Traitée tôt, elle se stabilise et les dents se gardent ; traitée tard, on ne récupère pas l''os perdu.</p>

<hr>

<p>Vos gencives saignent ou vos dents bougent ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et prenez rendez-vous en ligne pour un bilan parodontal.</p>', '/blog-covers/post-parodontite-dechaussement-dents-maroc.jpg', 'Examen des gencives avec miroir et sonde parodontale', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 8, 'Parodontite : dents qui se déchaussent', 'Parodontite : signes précoces, lien avec le diabète, bilan parodontal, surfaçage radiculaire, maintenance et prévention. Guide clair adapté au Maroc.', 'La gingivite est réversible ; la parodontite détruit l''os, et cet os ne se reconstitue pas seul.
Un saignement de gencive au brossage est le premier signe utile : il ne faut pas l''attribuer à la brosse.
Le traitement de base est mécanique : détartrage puis surfaçage radiculaire, plus une technique de brossage revue.
Une parodontite traitée est stabilisée, pas guérie : la maintenance tous les 3 à 6 mois évite la rechute.
Tabac, chicha et diabète déséquilibré sont les principaux accélérateurs de la maladie.', '[{"q":"Peut-on guérir d''une parodontite ?","a":"On peut la stabiliser, durablement, mais pas revenir à l''état antérieur : l''os détruit ne se reconstitue pas spontanément. L''assainissement arrête la progression et l''inflammation, et les dents peuvent être conservées des années. C''est pour cela que la maintenance tous les trois à six mois fait partie du traitement."},{"q":"Pourquoi mes gencives saignent-elles quand je me brosse les dents ?","a":"Un saignement traduit une inflammation de la gencive due à l''accumulation de plaque bactérienne, le plus souvent une gingivite. Ce n''est pas la brosse qui est en cause et ce n''est jamais banal. Au stade de gingivite, hygiène et détartrage suffisent généralement à tout faire disparaître."},{"q":"Une dent qui bouge peut-elle se resserrer ?","a":"Une mobilité liée à une inflammation peut diminuer après assainissement, car la gencive se raffermit. En revanche, si l''os de soutien a été détruit, la stabilité ne revient pas complètement ; le traitement vise alors à empêcher l''aggravation et, parfois, à solidariser les dents concernées."},{"q":"Le détartrage suffit-il contre la parodontite ?","a":"Non, pas seul. Le détartrage retire le tartre visible au-dessus de la gencive. La parodontite nécessite un surfaçage radiculaire, c''est-à-dire un nettoyage sous la gencive, à la surface des racines, réalisé sous anesthésie locale, complété par une technique de brossage adaptée et un suivi rapproché."},{"q":"Le détartrage abîme-t-il l''émail ou déchausse-t-il les dents ?","a":"Non. Le détartrage n''endommage pas l''émail. L''impression de dents plus longues ou plus sensibles après la séance vient du fait que le tartre masquait une récession déjà présente : c''est la maladie qui avait déchaussé la dent, pas le nettoyage. Une sensibilité passagère est fréquente et s''estompe."},{"q":"La parodontite est-elle héréditaire ou contagieuse ?","a":"Il existe une prédisposition familiale, avec des formes précoces et rapides chez certaines personnes. Les bactéries impliquées s''échangent par la salive, mais développer la maladie dépend du terrain, de l''hygiène et de facteurs comme le tabac ou le diabète. Un antécédent familial justifie un dépistage plus attentif."},{"q":"Quel lien entre diabète et maladie des gencives ?","a":"Le lien est réciproque et bien documenté : un diabète mal équilibré favorise et aggrave la parodontite, tandis qu''une parodontite active rend le contrôle de la glycémie plus difficile. Chez une personne diabétique, le suivi dentaire fait partie de la prise en charge du diabète."}]', '[{"label":"Comprendre la maladie des gencives : gingivite et parodontite","url":"https://www.ameli.fr/assure/sante/themes/maladie-gencives/definition-causes-symptomes","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Consultation et traitement de la gingivite et de la parodontite","url":"https://www.ameli.fr/assure/sante/themes/maladie-gencives/consultation-traitement-gingivite-parodontite","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Les complications du diabète au niveau des dents et des gencives","url":"https://www.ameli.fr/assure/sante/themes/diabete-adulte/diabete-symptomes-evolution/complications-dents-gencives","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Santé bucco-dentaire — principaux repères (parodontopathies sévères : plus d''un milliard de personnes)","url":"https://www.who.int/fr/news-room/fact-sheets/detail/oral-health","publisher":"Organisation mondiale de la Santé (OMS)","year":"2025"},{"label":"Enquête nationale de santé bucco-dentaire : état bucco-dentaire au Maroc","url":"https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire","publisher":"Ministère de la Santé (via Aujourd''hui le Maroc)","year":"2018"}]', 'Parodontite', (SELECT id FROM posts WHERE slug = 'mal-de-dents-rage-de-dents-maroc'), 'التهاب دواعم السن: لماذا تتزحزح الأسنان وكيف نوقف ذلك', 'التهاب دواعم السن: عدوى صامتة تُدمّر العظم حول الأسنان. العلامات التي يجب رصدها مبكّرًا، والعلاقة بالسكري، وما يستعيده العلاج فعلًا، وما يدخل ضمن الوعود الزائفة.', '<p>الأسنان لا تسقط لأنها تتقدّم في السنّ. إنها تسقط لأن ما يُثبّتها — اللثة والعظم — قد دُمِّر ببطء، بعدوى لا تكاد تؤلم. وهذه هي كل صعوبة التهاب دواعم السن: يتقدّم بلا ألم ويظهر متأخّرًا، حين يكون فقد العظم قد استقرّ. وتُقدّر منظمة الصحة العالمية أن الأشكال الشديدة من مرض دواعم السن تمسّ <strong>أكثر من مليار شخص</strong> في العالم.</p>

<p>يشرح هذا المقال كيف نرصد المرض مبكّرًا، ولماذا يتجاوز إطار الفم، وما يمكن للعلاج أن يستعيده فعلًا، وما يدخل في المقابل ضمن الوعود الزائفة. وهو يكمّل دليلنا <a href="/blog/mal-de-dents-rage-de-dents-maroc">ألم الأسنان</a> وبطاقة <a href="/maladies/gingivite">التهاب اللثة</a>.</p>

<h2>من التهاب اللثة إلى التهاب دواعم السن</h2>

<p>يبدأ كل شيء باللويحة الجرثومية، وهي طبقة تتمعدن فتصبح جيرًا. تلتهب اللثة: هذا هو <strong>التهاب اللثة</strong>، حمراء، متورّمة قليلًا، <a href="/symptomes/saignement-des-gencives">تنزف عند التفريش</a>. وفي هذه المرحلة، كل شيء <strong>قابل للرجوع</strong>: تكفي نظافة صارمة وإزالة الجير في الغالب.</p>

<p>وإذا استمرّ الالتهاب، ينتقل تحت اللثة. فينفصل الارتباط ويتشكّل <strong>جيب حول سنّي</strong>، أي حيّز لا تبلغه الفرشاة وتتكاثر فيه الجراثيم. ويبدأ العظم المحيط بالجذر في الذوبان. هذا هو <strong>التهاب دواعم السن</strong> — وفقد العظم هذا، بخلاف التهاب اللثة، <strong>لا يتشكّل من جديد تلقائيًّا</strong>. فيصبح هدف العلاج وقف التقدّم، لا الرجوع إلى الوراء.</p>

<table>
<thead>
<tr><th>المرحلة</th><th>ما نلاحظه</th><th>ما يمكن للعلاج تحقيقه</th></tr>
</thead>
<tbody>
<tr><td>لثة سليمة</td><td>وردية فاتحة، متينة، بلا أيّ نزف عند التفريش</td><td>الحفاظ عليها بالنظافة والمراقبة السنوية</td></tr>
<tr><td>التهاب اللثة</td><td>احمرار، تورّم، نزف عند التفريش، بلا فقد عظم</td><td><strong>رجوع كامل إلى الحالة الطبيعية</strong></td></tr>
<tr><td>التهاب دواعم مبتدئ</td><td>جيوب سطحية، بداية فقد عظم في الصورة</td><td>وقف التطوّر، لثة أكثر متانة</td></tr>
<tr><td>التهاب دواعم متوسّط إلى شديد</td><td>جيوب عميقة، تراجع اللثة، تحرّك الأسنان، فراغات تتّسع</td><td>تثبيت الحالة؛ أما العظم المفقود فلا يعود</td></tr>
</tbody>
</table>

<h2>العلامات التي يجب رصدها مبكّرًا</h2>

<ul>
<li><strong>نزف</strong> عند التفريش أو باستعمال الخيط السنّي — أوّل إشارة، وأكثر ما يُستهان به.</li>
<li>لثة حمراء، متورّمة، حسّاسة للتلامس.</li>
<li><strong>تراجع اللثة</strong>: تبدو الأسنان أطول، وتتكشّف الأعناق، وتزيد الحساسية للبرد.</li>
<li><a href="/symptomes/mauvaise-haleine">رائحة فم كريهة</a> مستمرّة، طعم مزعج.</li>
<li>فراغات تظهر بين الأسنان، وأطعمة تعلق فيها.</li>
<li><strong>تحرّك</strong> الأسنان، أسنان «تتزحزح» أو يتغيّر موضعها، وانزعاج في المضغ.</li>
<li>خُراج لثوي متكرّر.</li>
</ul>

<blockquote>نزف اللثة ليس طبيعيًّا أبدًا، ولو كان بسيطًا وبلا ألم. إنه العلامة الأكثر تبكيرًا والأكثر نفعًا؛ وهو أيضًا العلامة التي تترك للعلاج أوسع هامش للتحرّك.</blockquote>

<h2>لماذا لا يقتصر الأمر على الفم</h2>

<p>التهاب دواعم السن عدوى مزمنة تُبقي التهابًا خفيّ الشدّة في الجسم كلّه. وهناك علاقتان موثّقتان بشكل خاص:</p>

<ul>
<li><strong><a href="/blog/diabete-type-2-maroc">السكري</a></strong>، في الاتجاهين: سكري غير متوازن يُشجّع التهاب دواعم السن ويُفاقمه؛ والتهاب دواعم نشط يجعل ضبط السكر في الدم أصعب. فمعالجة اللثة جزء من التكفّل بالسكري، لا رفاهية ثانوية.</li>
<li><strong>الخطر القلبي الوعائي</strong>، المرتبط بالالتهاب المزمن — حجّة إضافية، مع التبغ، لعدم إهمال الأمر. انظر مقالنا عن <a href="/blog/prevention-cardiovasculaire-maroc">الوقاية القلبية الوعائية</a>.</li>
</ul>

<p>وعند الحامل، تكون اللثة أكثر تفاعلًا تحت التأثير الهرموني ويستقرّ التهاب اللثة بسهولة: لذا تُستحسَن العلاجات خلال الحمل (انظري <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>).</p>

<h2>ما يزيد الخطر</h2>

<ul>
<li><strong>التبغ والشيشة</strong> — عامل خطر رئيسي، يُخفي فوق ذلك النزف ويعطي إحساسًا زائفًا بلثة سليمة. انظر <a href="/blog/arret-tabac-sevrage-maroc">الإقلاع عن التدخين</a>.</li>
<li>سكري غير متوازن، نقص مناعة.</li>
<li>استعداد عائلي: توجد أشكال مبكّرة وعدوانية، حتى عند الشابّ.</li>
<li><a href="/maladies/bruxisme">صريف الأسنان</a>، الذي يُحمّل أسنانًا أصلًا هشّة.</li>
<li>جير مستقرّ، ترميمات فائضة، أسنان <a href="/symptomes/dents-mal-alignees">غير مصطفّة</a> يصعب تنظيفها.</li>
<li>بعض الأدوية، التنفّس الفموي، الضغط النفسي.</li>
</ul>

<h3>مطبّ المدخّن</h3>

<p>التبغ يُضيّق أوعية اللثة. والنتيجة: عند المدخّن، <strong>تنزف اللثة أقلّ</strong> بينما يتقدّم المرض أكثر. لذا يعتقد كثير من المدخّنين أنهم في مأمن حتى يوم يتحرّك فيه سنّ. فإن كنت تدخّن، لا تعتمد على غياب النزف كمؤشّر: الجَسّ في العيادة هو ما يقول الحقيقة، والكشف يجب أن يكون أكثر انتظامًا لا أقلّ.</p>

<p>ويُضاف هذا التحيّز إلى واقع مغربي: حسب المسح الوطني للصحة الفموية، لم يستشر جزء مهمّ من السكان طبيب أسنان قطّ، وتُقدّر البلاد بطبيب أسنان واحد لكل 8 100 نسمة تقريبًا. لذا يُكتشَف مرض دواعم السن غالبًا في مرحلة يكون فيها العظم قد تضرّر — سبب إضافي لتحويل أوّل نزف إلى موعد.</p>

<h2>كيف يُوضَع التشخيص</h2>

<p>يُجري الممارس <strong>فحصًا لدواعم السن</strong>: يقيس، سنًّا بسنّ، عمق الجيوب بالمِسبَر، ويسجّل النزف والتراجعات والتحرّكات. وتُوضّح <strong>الصور الشعاعية</strong> فقد العظم وتُستعمَل مرجعًا لتتبّع التطوّر. وهذا السجلّ — لا الانطباع البصري — هو ما يسمح بالقول إن كان الأمر التهاب لثة أو التهاب دواعم سن، وفي أيّ مرحلة. ويتولّى <a href="/specialites/chirurgie-dentaire">جرّاح الأسنان</a> التكفّل؛ وقد تُحوَّل الأشكال المتقدّمة إلى أخصّائي دواعم السن.</p>

<h2>العلاج: ما ينجح فعلًا</h2>

<h3>1. التنظيف غير الجراحي</h3>

<p>هو الأساس، وهو ناجع. إزالة جير كاملة، ثم <strong>تسوية سطح الجذور</strong>: تنظيف عميق، تحت اللثة، يُزيل الجير والنسيج المُصاب من سطح الجذور ليسمح للثة بالالتصاق مجدّدًا. ويُنجَز التدخّل تحت تخدير موضعي، في جلسة أو عدّة جلسات حسب الامتداد. وبالتوازي، تُراجَع <strong>تقنية التفريش</strong> والتنظيف بين الأسنان — فبدون ذلك لا تصمد الفائدة.</p>

<h3>2. الجراحة، إن لزمت</h3>

<p>عندما تستمرّ جيوب عميقة بعد التنظيف، يسمح عمل جراحي بالوصول إلى المناطق غير المتاحة، وبإعادة تشكيل اللثة، وأحيانًا بمحاولة تجديد عظمي في عيوب محدّدة المعالم. وهو خيار موجَّه، لا مرحلة إلزامية.</p>

<h3>3. الصيانة، مدى الحياة</h3>

<p>هذه هي النقطة التي يكتشفها المرضى متأخّرين غالبًا: التهاب دواعم السن المعالَج مرض <strong>مُستقِرّ لا مشفيّ</strong>. فزيارات مراقبة متقاربة، كل ثلاثة إلى ستة أشهر عمومًا حسب الخطر، مع تنظيف صيانة، هي ما يفرّق بين استقرار دائم ونكس. انظر <a href="/questions/mes-dents-se-dechaussent-parodontite-comment-arreter-la-progression">كيف نوقف تقدّم التهاب دواعم السن</a>.</p>

<h2>التراجعات والحساسية والأسنان المفقودة: العواقب المحتملة</h2>

<p>بعد تثبيت المرض، يبقى غالبًا معالجة آثاره. فـ<strong>التراجعات</strong> — أعناق مكشوفة، أسنان تبدو أطول بصريًّا — تفسّر الحساسية للبرد وللفرشاة؛ وتسمح معاجين ملائمة وطبقات واقية تُوضَع في العيادة، وفي بعض الحالات ترقيع لثوي، بتحسين الراحة والمظهر. واحذر ردّ الفعل المعاكس: التفريش الأقوى يُفاقم التراجع.</p>

<p>وعند فقد سنّ أو أكثر، تُناقَش البدائل <strong>بعد</strong> التثبيت لا قبله: جسر، أو طقم متحرّك، أو <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">زرعة</a>، حسب حجم العظم المتبقّي وضبط المرض. وفي هذه اللحظة يصبح دور <a href="/blog/abces-dentaire-maroc">ضبط البؤر الخمجية</a> حاسمًا: فخُراج حول سنّي مُهمَل قد يُفقد في بضعة أشهر العظم الذي كنّا نأمل استعماله.</p>

<h2>ما لا ينجح</h2>

<ul>
<li><strong>المضمضات وحدها.</strong> قد تكمّل علاجًا، لمدّة محدودة وبوصفة؛ لكنها لا تنفذ إلى جيب ولا تُغني عن أيّ عمل ميكانيكي. واستعمالها طويل الأمد دون رأي طبّي له مضارّه.</li>
<li><strong>المضادات الحيوية وحدها.</strong> بدون تنظيف، لا أثر دائم لها. انظر <a href="/blog/antibiotiques-maroc">الاستعمال الرشيد للمضادات الحيوية</a>.</li>
<li><strong>التفريش بقوّة أكبر.</strong> التفريش العنيف يُتلف اللثة ويُسرّع التراجع. فالمهمّ الانتظام والتقنية، لا القوّة.</li>
<li><strong>انتظار أن يزول التحرّك.</strong> سنّ متحرّك بسبب التهاب دواعم السن لا يشتدّ من تلقاء نفسه.</li>
<li><strong>وضع زرعة دون معالجة المرض.</strong> فالأنسجة حول الزرعة قد تُخمَج بالطريقة نفسها: التهاب دواعم غير مستقرّ يُضرّ بالنتيجة — انظر <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">زرع الأسنان</a>.</li>
</ul>

<h2>الوقاية اليومية</h2>

<ul>
<li><strong>تفريشان يوميًّا، دقيقتان</strong>، فرشاة ناعمة، معجون بالفلور، مع التركيز على ملتقى السنّ واللثة.</li>
<li><strong>تنظيف بين الأسنان يوميًّا</strong> — خيط أو فُرَش بينيّة، تُختار مع الممارس حسب الفراغات. وهذه هي الإضافة التي تُغيّر الأمور أكثر من غيرها.</li>
<li><strong>إزالة جير منتظمة</strong> ومراقبة مرّة إلى مرّتين سنويًّا: انظر <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">بأيّ تواتر</a> و<a href="/prevenir/gingivite">الوقاية من أمراض اللثة</a>.</li>
<li><strong>الإقلاع عن التبغ والشيشة</strong>: هذه، مع النظافة، أقوى رافعة.</li>
<li><strong>موازنة السكري</strong> والإبلاغ عن أيّ علاج طويل الأمد.</li>
<li><strong>الاستشارة من أوّل نزف</strong>، دون انتظار التحرّك.</li>
</ul>

<p>ومن الناحية المالية، المنطق هو نفسه كما في التسوّس: إزالة جير وتنظيف مبكّران يكلّفان أقلّ بكثير من علاج التهاب دواعم متقدّم متبوعًا بتعويضات. وتُفصّل صفحتانا <a href="/prix">أسعار الأعمال</a> و<a href="/remboursement-amo-cnss">التعويض AMO / CNSS</a> آلية الباقي على عاتقك.</p>

<h2>الخلاصة</h2>

<p>التهاب دواعم السن مرض صامت، شائع وقابل للعلاج، ويتوقّف مآله شبه كليًّا على اللحظة التي نأخذه فيها. ونزف اللثة دعوة للاستشارة، لا تفصيل نظافة. فإن عُولج مبكّرًا استقرّ وحُفظت الأسنان؛ وإن عُولج متأخّرًا، فلا نستعيد العظم المفقود.</p>

<hr>

<p>لثتك تنزف أو أسنانك تتحرّك؟ على SantéauMaroc، <a href="/specialites/chirurgie-dentaire">اعثر على جرّاح أسنان قريب منك</a>، واطّلع على الملفات المتحقَّق منها، واحجز موعدًا عبر الإنترنت لفحص دواعم السن.</p>', 'التهاب دواعم السن: تزحزح الأسنان | المغرب', 'التهاب دواعم السن: العلامات المبكّرة، العلاقة بالسكري، فحص دواعم السن، تسوية سطح الجذور، الصيانة والوقاية. دليل واضح ملائم للمغرب.', 'التهاب اللثة قابل للرجوع؛ أما التهاب دواعم السن فيُدمّر العظم، وهذا العظم لا يتشكّل من جديد وحده.
نزف اللثة عند التفريش هو أوّل علامة مفيدة: لا تنسبه إلى الفرشاة.
العلاج الأساسي ميكانيكي: إزالة جير ثم تسوية سطح الجذور، مع مراجعة تقنية التفريش.
التهاب دواعم السن المعالَج مُستقِرّ لا مشفيّ: الصيانة كل 3 إلى 6 أشهر تمنع النكس.
التبغ والشيشة والسكري غير المتوازن هي أهمّ مُسرّعات المرض.', '[{"q":"هل يمكن الشفاء من التهاب دواعم السن؟","a":"يمكن تثبيته، بشكل دائم، لكن لا يمكن الرجوع إلى الحالة السابقة: فالعظم المدمَّر لا يتشكّل من جديد تلقائيًّا. والتنظيف يوقف التقدّم والالتهاب، ويمكن حفظ الأسنان سنوات. ولهذا تُعدّ الصيانة كل ثلاثة إلى ستة أشهر جزءًا من العلاج."},{"q":"لماذا تنزف لثتي عند تفريش أسناني؟","a":"النزف يعبّر عن التهاب في اللثة بسبب تراكم اللويحة الجرثومية، وهو في الغالب التهاب لثة. ليست الفرشاة هي السبب، والأمر ليس عاديًّا أبدًا. وفي مرحلة التهاب اللثة، تكفي النظافة وإزالة الجير عمومًا لإزالة كل شيء."},{"q":"هل يمكن لسنّ متحرّك أن يعود ثابتًا؟","a":"تحرّك ناتج عن التهاب قد يتراجع بعد التنظيف، لأن اللثة تشتدّ. أما إذا كان عظم الإسناد قد دُمِّر، فلا يعود الثبات كاملًا؛ ويهدف العلاج حينها إلى منع التفاقم، وأحيانًا إلى تثبيت الأسنان المعنيّة معًا."},{"q":"هل تكفي إزالة الجير ضدّ التهاب دواعم السن؟","a":"لا، ليست وحدها. إزالة الجير تُزيل الجير الظاهر فوق اللثة. أما التهاب دواعم السن فيستلزم تسوية سطح الجذور، أي تنظيفًا تحت اللثة على سطح الجذور، يُنجَز تحت تخدير موضعي، مع تقنية تفريش ملائمة وتتبّع متقارب."},{"q":"هل تُتلف إزالة الجير المينا أو تُفقد الأسنان ثباتها؟","a":"لا. إزالة الجير لا تُتلف المينا. والإحساس بأن الأسنان أطول أو أكثر حساسية بعد الجلسة يأتي من أن الجير كان يُخفي تراجعًا موجودًا أصلًا: فالمرض هو ما أفقد السنّ ثباته، لا التنظيف. والحساسية العابرة شائعة وتخبو."},{"q":"هل التهاب دواعم السن وراثي أم معدٍ؟","a":"يوجد استعداد عائلي، مع أشكال مبكّرة وسريعة عند بعض الأشخاص. والجراثيم المعنيّة تُتبادَل عبر اللعاب، لكن نشوء المرض يتوقّف على الأرضية والنظافة وعوامل مثل التبغ أو السكري. وسابقة عائلية تبرّر كشفًا أكثر انتباهًا."},{"q":"ما العلاقة بين السكري وأمراض اللثة؟","a":"العلاقة متبادلة وموثّقة جيّدًا: سكري غير متوازن يُشجّع التهاب دواعم السن ويُفاقمه، بينما يجعل التهاب دواعم نشط ضبط السكر في الدم أصعب. وعند الشخص المصاب بالسكري، يُعدّ التتبّع السنّي جزءًا من التكفّل بالسكري."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- carie-dentaire-maroc  (satellite du pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdh31qw000048npgn9zk3fw', 'Carie dentaire : la repérer avant la douleur et éviter la dévitalisation', 'carie-dentaire-maroc', 'La carie ne fait pas mal au début, et c''est tout le problème. Comment elle se forme, comment la repérer avant la rage de dents, ce que chaque stade implique en soins, et les gestes de prévention réellement efficaces. Un guide complet adapté au Maroc.', '<p>La carie est la maladie chronique la plus répandue au monde, et elle a une particularité qui explique presque tous les dégâts qu''elle provoque : <strong>elle ne fait pas mal au début</strong>. Elle s''installe pendant des mois, parfois des années, dans un silence complet. Quand la douleur arrive, l''essentiel du travail de destruction est déjà fait, et le soin qui aurait pris quinze minutes devient une dévitalisation, une couronne, ou une extraction.</p>

<p>Au Maroc, l''enquête nationale de santé bucco-dentaire du ministère de la Santé donne la mesure du problème : <strong>92 % des adultes de 35 à 44 ans</strong> sont touchés, 81 % des enfants de 12 ans, et 27 % des adultes n''ont jamais consulté de dentiste. Cet article explique comment une carie se forme, comment la repérer avant la douleur, ce que chaque stade implique en soins, et les gestes de prévention dont l''efficacité est réellement démontrée.</p>

<h2>Comment une carie se forme</h2>

<p>Trois éléments doivent se rencontrer : des <strong>bactéries</strong>, qui vivent normalement dans la bouche et forment la plaque dentaire ; des <strong>sucres fermentescibles</strong>, qu''elles transforment en acides ; et du <strong>temps</strong>. Chaque prise de sucre déclenche une attaque acide qui dissout les minéraux de l''émail pendant une vingtaine de minutes. Entre deux attaques, la salive neutralise l''acidité et reminéralise la surface — à condition qu''on lui laisse le temps de le faire.</p>

<blockquote>C''est le point le plus mal connu, et le plus utile : ce qui compte n''est pas tant la <em>quantité</em> de sucre que la <strong>fréquence</strong> des prises. Un verre de thé très sucré siroté pendant toute la matinée entretient une acidité continue et abîme plus l''émail qu''une pâtisserie mangée d''un coup en fin de repas. Même logique pour les boissons gazeuses, les jus industriels et le grignotage.</blockquote>

<p>Quand les attaques l''emportent sur la réparation, la déminéralisation se creuse et devient une cavité. À partir de là, le processus ne s''inverse plus tout seul : la carie ne se referme pas, elle progresse.</p>

<h2>Les quatre stades, et ce que chacun coûte en soins</h2>

<table>
<thead>
<tr><th>Stade</th><th>Ce que vous ressentez</th><th>Ce que fait le dentiste</th></tr>
</thead>
<tbody>
<tr><td><strong>1. Émail</strong></td><td>Rien. Parfois une tache blanche ou brune</td><td>Reminéralisation, surveillance, ou petite obturation. Une séance courte</td></tr>
<tr><td><strong>2. Dentine</strong></td><td>Sensibilité au froid, au chaud, au sucré, qui s''arrête vite</td><td>Nettoyage de la cavité et obturation (composite). Une séance</td></tr>
<tr><td><strong>3. Pulpe (pulpite)</strong></td><td>Douleur forte, continue, qui réveille la nuit : la rage de dents</td><td><a href="/comment-traiter/carie-dentaire">Dévitalisation</a> : nettoyage et obturation des canaux, puis reconstitution, souvent une couronne. Plusieurs séances</td></tr>
<tr><td><strong>4. Nécrose et <a href="/blog/abces-dentaire-maroc">abcès</a></strong></td><td>Douleur pulsatile, dent intouchable, gonflement, parfois fièvre</td><td>Drainage puis traitement du canal, ou extraction si la dent n''est pas récupérable</td></tr>
</tbody>
</table>

<p>Ce tableau est l''argument central de la prévention : entre le stade 1 et le stade 4, ce n''est pas la même maladie qu''on traite, c''est le même problème pris à quatre moments différents — avec un écart considérable de temps, d''inconfort et de coût.</p>

<h2>Les signes qui doivent alerter</h2>

<ul>
<li>Une <a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">sensibilité nouvelle</a> au froid, au chaud ou au sucré sur une dent précise.</li>
<li>Une tache blanche crayeuse, brune ou noire sur l''émail.</li>
<li>Un aliment qui se coince toujours au même endroit, ou du fil dentaire qui s''effiloche systématiquement au même espace.</li>
<li>Une rugosité ou un « trou » que la langue détecte.</li>
<li>Une <a href="/symptomes/mauvaise-haleine">mauvaise haleine</a> localisée, un mauvais goût.</li>
<li>Une douleur à la mastication, même brève.</li>
</ul>

<p>Deux situations trompent particulièrement. La carie <strong>entre deux dents</strong> ne se voit pas dans le miroir : seule une radiographie la révèle. Et la carie <strong>sous une ancienne obturation</strong> ou sous une couronne progresse à l''abri des regards. C''est précisément à cela que sert un contrôle annuel chez quelqu''un qui n''a mal à rien.</p>

<h2>Pourquoi on ne la sent pas au début</h2>

<p>L''émail ne contient aucune terminaison nerveuse : une lésion qui y reste confinée est indolore par construction. La sensibilité n''apparaît qu''en atteignant la dentine, traversée de canalicules qui transmettent les variations de température. Et la douleur franche n''arrive qu''à la pulpe, quand l''inflammation se produit dans une cavité fermée qui ne peut pas gonfler. Autrement dit : <strong>l''ordre d''apparition des symptômes suit la profondeur de la lésion</strong>, pas sa gravité initiale. Attendre la douleur pour consulter, c''est structurellement arriver en retard.</p>

<h2>Ce que le dentiste peut faire, selon le moment</h2>

<p>Le diagnostic associe l''examen clinique et la <strong>radiographie</strong>, indispensable pour les faces cachées et pour évaluer la proximité du nerf. Le traitement suit ce qui a été trouvé : reminéralisation et surveillance sur une lésion débutante ; nettoyage puis obturation quand la cavité est constituée ; dévitalisation quand le nerf est atteint ; reconstitution prothétique quand il ne reste plus assez de dent ; extraction en dernier recours, suivie d''une discussion sur le remplacement — bridge, prothèse ou <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">implant</a>.</p>

<p>Sur le plan financier, la logique est simple et vérifiable : plus le stade est précoce, plus l''acte est court et léger. Les honoraires étant libres dans le privé, demandez un <strong>devis écrit</strong> avant tout acte prothétique, et une prise en charge préalable quand elle est exigée. Nos pages <a href="/prix">tarifs des actes médicaux au Maroc</a> et <a href="/remboursement-amo-cnss">remboursement AMO / CNSS</a> détaillent la mécanique du reste à charge, calculé sur la tarification nationale de référence — actuellement en cours de révision — et non sur le montant facturé.</p>

<h2>Chez l''enfant : les dents de lait comptent</h2>

<p>L''idée qu''une dent de lait cariée « va tomber de toute façon » coûte cher. Une carie sur une dent de lait fait mal, gêne l''alimentation, peut s''infecter au contact du germe de la dent définitive, et la perte prématurée d''une dent de lait perturbe l''alignement des dents qui suivent.</p>

<ul>
<li><strong>Dès la première dent</strong>, nettoyage avec une brosse adaptée ; dentifrice fluoré à la dose recommandée pour l''âge, indiquée par le praticien.</li>
<li><strong>Pas de biberon sucré au coucher</strong> ni de tétine trempée dans du miel ou du sucre : la salive diminue la nuit, l''attaque acide dure jusqu''au matin.</li>
<li><strong>Brossage supervisé</strong> par un adulte jusqu''à ce que le geste soit acquis, généralement vers 7-8 ans.</li>
<li><strong>Première visite tôt</strong>, puis contrôle régulier : l''enjeu est autant le dépistage que l''habituation au cabinet, qui évite la peur du dentiste à l''âge adulte.</li>
<li>En cas de fièvre ou de gonflement, voir notre article <a href="/blog/fievre-enfant-que-faire-maroc">fièvre de l''enfant</a> et notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l''enfant</a>.</li>
</ul>

<h2>Après 60 ans : la carie du collet</h2>

<p>Chez la personne âgée, la carie change de visage. Elle ne se forme plus au sommet de la dent mais au <strong>collet</strong>, à la limite de la gencive rétractée, sur une surface de racine moins minéralisée que l''émail et donc plus vulnérable. Trois facteurs se cumulent : la récession gingivale liée aux <a href="/blog/parodontite-dechaussement-dents-maroc">maladies parodontales</a>, la <strong>sécheresse buccale</strong> provoquée par de nombreux traitements au long cours — voir <a href="/blog/polymedication-senior-maroc">la polymédication du senior</a> —, et la difficulté croissante du geste de brossage.</p>

<p>Ces caries évoluent vite et fragilisent la dent à sa base, avec un risque de fracture. Elles justifient un rythme de contrôle resserré, des brossettes plutôt que du fil quand les espaces se sont ouverts, un dentifrice à teneur en fluor adaptée sur avis du praticien, et l''attention portée à l''alimentation — voir <a href="/blog/nutrition-personne-agee-maroc">nutrition de la personne âgée</a>.</p>

<h2>La prévention, dans l''ordre d''efficacité</h2>

<ol>
<li><strong>Deux brossages par jour, deux minutes, avec un dentifrice fluoré.</strong> C''est la mesure dont le bénéfice est le mieux établi. Le fluor protège l''émail des attaques acides et favorise sa reminéralisation. Brosse à poils souples, changée environ tous les trois mois, mouvement de la gencive vers la dent, sans oublier les faces internes ni les dernières molaires.</li>
<li><strong>Le nettoyage entre les dents, une fois par jour</strong> — fil ou brossettes, choisies avec le praticien selon vos espaces. La brosse ne nettoie pas les faces où naissent la majorité des caries invisibles.</li>
<li><strong>Espacer les prises de sucre</strong> plus encore que les réduire : limiter le grignotage, le thé très sucré siroté longuement, les boissons gazeuses et les jus. Boire de l''eau après une prise sucrée aide.</li>
<li><strong>Un contrôle une à deux fois par an</strong>, même sans douleur, avec <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">détartrage</a> selon les besoins — c''est ce qui permet de traiter au stade 1 ou 2 plutôt qu''au stade 3.</li>
<li><strong>Ne pas fumer</strong> : le tabac et la chicha favorisent les <a href="/blog/parodontite-dechaussement-dents-maroc">maladies des gencives</a>, qui exposent les collets — zones où la carie s''installe facilement. Voir <a href="/blog/arret-tabac-sevrage-maroc">arrêter de fumer</a>.</li>
<li><strong>Signaler une bouche sèche</strong> : certains médicaments et certaines maladies réduisent la salive, donc la protection naturelle. Chez la personne <a href="/blog/diabete-type-2-maroc">diabétique</a>, le risque de carie et d''infection gingivale est majoré.</li>
</ol>

<p>Pour aller plus loin : <a href="/prevenir/carie-dentaire">prévenir la carie dentaire</a>, <a href="/prevenir/gingivite">prévenir la maladie des gencives</a> et la question <a href="/questions/comment-prevenir-les-caries-et-garder-des-dents-saines">comment prévenir les caries</a>.</p>

<h2>Ce qui ne protège pas</h2>

<ul>
<li><strong>Brosser plus fort ou plus longtemps.</strong> Un brossage agressif use l''émail et abîme la gencive ; c''est la technique et la régularité qui comptent.</li>
<li><strong>Les bains de bouche seuls.</strong> Ils ne remplacent aucun geste mécanique.</li>
<li><strong>Les dentifrices « blancheur » abrasifs</strong> et le <a href="/questions/blanchiment-des-dents-est-ce-sans-danger-pour-l-email-de-mes">blanchiment</a> répété sans avis : ils n''ont aucun effet préventif sur la carie.</li>
<li><strong>Attendre la douleur.</strong> Le seul moment où une carie est simple à traiter est celui où elle ne se manifeste pas.</li>
</ul>

<h2>En résumé</h2>

<p>La carie est une maladie lente, silencieuse et évitable, dont le coût final dépend presque entièrement du moment où on la prend. Deux brossages fluorés par jour, un nettoyage interdentaire quotidien, moins de prises sucrées et un contrôle annuel suffisent à éviter la grande majorité des soins lourds. En cas de douleur installée, voir notre guide <a href="/blog/mal-de-dents-rage-de-dents-maroc">mal de dents</a> ; pour savoir qui consulter, notre page <a href="/quel-medecin-pour/mal-de-dents">quel médecin pour un mal de dents</a>.</p>

<hr>

<p>Une tache, une sensibilité, ou simplement un contrôle en retard ? Sur SantéauMaroc, <a href="/specialites/chirurgie-dentaire">trouvez un chirurgien-dentiste près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>', '/blog-covers/post-carie-dentaire-maroc.jpg', 'Brossage des dents avec une brosse souple et un dentifrice fluoré', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 8, 'Carie dentaire : signes, soins, prévention', 'Carie dentaire : les quatre stades et les soins associés, les signes à repérer sans douleur, l''enfant et la prévention. Adapté au Maroc.', 'Une carie ne fait pas mal au début : l''émail n''a pas de nerf. Attendre la douleur, c''est arriver au stade de la dévitalisation.
Ce qui abîme l''émail, c''est la fréquence des prises de sucre plus que la quantité : le thé très sucré siroté toute la matinée est pire qu''un dessert.
Une carie constituée ne se referme jamais seule ; seul le stade débutant peut être reminéralisé.
Les caries entre les dents et sous les anciennes obturations ne se voient qu''à la radiographie : c''est l''utilité du contrôle annuel sans symptôme.
Chez l''enfant, une dent de lait cariée doit être soignée : elle fait mal, peut s''infecter et sa perte précoce dérègle l''alignement.
Prévention par ordre d''efficacité : brossage fluoré 2 × 2 min, fil ou brossettes chaque jour, moins de prises sucrées, contrôle annuel.', '[{"q":"Une carie peut-elle guérir toute seule ?","a":"Seule une lésion très débutante, limitée à l''émail, peut être reminéralisée grâce au fluor et à une hygiène rigoureuse. Dès qu''une cavité est constituée, le processus ne s''inverse plus : la carie progresse et nécessite un soin. C''est pourquoi le dépistage précoce change tout."},{"q":"Comment savoir si j''ai une carie sans douleur ?","a":"Par des signes indirects : une tache blanche, brune ou noire, une sensibilité nouvelle au froid ou au sucré sur une dent, un aliment qui se coince toujours au même endroit, une rugosité détectée par la langue. Les caries entre les dents, elles, ne se voient qu''à la radiographie — d''où l''intérêt du contrôle annuel."},{"q":"Combien de temps met une carie à atteindre le nerf ?","a":"C''est très variable : de quelques mois à plusieurs années, selon l''alimentation, l''hygiène, la qualité de la salive et la localisation de la lésion. Une carie peut évoluer rapidement chez un enfant ou en cas de bouche sèche, et rester longtemps stable chez quelqu''un dont l''hygiène est excellente."},{"q":"Le sucre est-il vraiment la seule cause des caries ?","a":"C''est le carburant principal : les bactéries transforment les sucres en acides qui dissolvent l''émail. Mais d''autres facteurs pèsent : la fréquence des prises, l''hygiène, la quantité et la qualité de la salive, la position des dents, le tabac, certaines maladies et certains médicaments qui assèchent la bouche."},{"q":"Le fluor est-il dangereux ?","a":"Aux doses des dentifrices, le fluor est efficace et sûr : c''est la mesure de prévention de la carie la mieux documentée. Le risque concerne les surdosages chez le jeune enfant, d''où l''importance d''utiliser une quantité adaptée à l''âge, indiquée par le chirurgien-dentiste, et de superviser le brossage."},{"q":"Faut-il soigner une carie sur une dent de lait ?","a":"Oui. Une dent de lait cariée est douloureuse, peut s''infecter au contact du germe de la dent définitive, et sa perte prématurée perturbe l''alignement des dents suivantes. L''argument « elle va tomber de toute façon » conduit régulièrement à des soins plus lourds ensuite."},{"q":"Une dent dévitalisée peut-elle encore se carier ?","a":"La dent ne ressent plus la douleur, mais elle peut se carier sur ses parties restantes, notamment sous une couronne ou au niveau du collet, et l''infection peut réapparaître à la pointe de la racine. Une dent dévitalisée demande donc la même hygiène et la même surveillance que les autres, sinon davantage."},{"q":"À quelle fréquence faut-il voir le dentiste sans douleur ?","a":"Une à deux fois par an pour la plupart des adultes, avec un détartrage selon les besoins. Le rythme est resserré en cas de risque élevé : diabète, tabac, bouche sèche, maladie des gencives, antécédents de caries multiples, grossesse, ou appareil orthodontique."}]', '[{"label":"Symptômes et évolution de la carie dentaire","url":"https://www.ameli.fr/assure/sante/themes/carie-dentaire/symptomes-diagnostic","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Prévenir les caries dentaires","url":"https://www.ameli.fr/assure/sante/themes/carie-dentaire/prevention","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Comment bien se brosser les dents ?","url":"https://www.ameli.fr/assure/sante/bons-gestes/quotidien/brosser-dents","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Santé bucco-dentaire — principaux repères","url":"https://www.who.int/fr/news-room/fact-sheets/detail/oral-health","publisher":"Organisation mondiale de la Santé (OMS)","year":"2025"},{"label":"Enquête nationale de santé bucco-dentaire : prévalence de la carie au Maroc","url":"https://aujourdhui.ma/societe/les-marocains-negligent-leur-hygiene-bucco-dentaire","publisher":"Ministère de la Santé (via Aujourd''hui le Maroc)","year":"2018"}]', 'Carie dentaire', (SELECT id FROM posts WHERE slug = 'mal-de-dents-rage-de-dents-maroc'), 'تسوّس الأسنان: رصده قبل الألم وتفادي سحب العصب', 'التسوّس لا يؤلم في البداية، وهذه هي المشكلة كلّها. كيف يتشكّل، كيف نرصده قبل الألم الحادّ، ما يستلزمه كل طور من علاجات، وإجراءات الوقاية الفعّالة حقًّا. دليل كامل ملائم للمغرب.', '<p>التسوّس هو المرض المزمن الأكثر انتشارًا في العالم، وله خصوصية تفسّر شبه كل الأضرار التي يُحدثها: <strong>إنه لا يؤلم في البداية</strong>. يستقرّ أشهرًا، وأحيانًا سنوات، في صمت تامّ. وعندما يأتي الألم، يكون معظم عمل التدمير قد أُنجز، ويصبح العلاج الذي كان سيأخذ خمس عشرة دقيقة سحبَ عصب، أو تاجًا، أو قلعًا.</p>

<p>وفي المغرب، يُعطي المسح الوطني للصحة الفموية لوزارة الصحة حجم المشكلة: <strong>92 % من البالغين بين 35 و44 سنة</strong> مصابون، و81 % من أطفال 12 سنة، و27 % من البالغين لم يستشيروا طبيب أسنان قطّ. يشرح هذا المقال كيف يتشكّل التسوّس، وكيف نرصده قبل الألم، وما يستلزمه كل طور من علاجات، وإجراءات الوقاية التي أُثبتت فعاليتها فعلًا.</p>

<h2>كيف يتشكّل التسوّس</h2>

<p>يجب أن تلتقي ثلاثة عناصر: <strong>جراثيم</strong>، تعيش عادةً في الفم وتُشكّل اللويحة الجرثومية؛ و<strong>سكّريات قابلة للتخمّر</strong>، تحوّلها إلى أحماض؛ و<strong>وقت</strong>. فكلّ تناول للسكّر يُطلق هجمة حمضية تُذيب معادن المينا نحو عشرين دقيقة. وبين هجمتين، يُعادل اللعاب الحموضة ويُعيد تمعدن السطح — بشرط أن نترك له الوقت لذلك.</p>

<blockquote>هذه هي النقطة الأقلّ معرفةً والأكثر نفعًا: ما يهمّ ليس <em>كمّية</em> السكّر بل <strong>تواتر</strong> تناوله. فكأس شاي شديد الحلاوة يُرتشف طوال الصباح يُبقي حموضة متواصلة ويُتلف المينا أكثر من حلوى تُؤكل دفعة واحدة في نهاية وجبة. والمنطق نفسه ينطبق على المشروبات الغازية والعصائر الصناعية والتقميش بين الوجبات.</blockquote>

<p>وعندما تتغلّب الهجمات على الإصلاح، يتعمّق نزع المعادن ويصبح تجويفًا. ومن هذه اللحظة لا تنقلب العملية وحدها: التسوّس لا يُغلق نفسه، بل يتقدّم.</p>

<h2>الأطوار الأربعة، وما يكلّفه كلّ منها من علاج</h2>

<table>
<thead>
<tr><th>الطور</th><th>ما تشعر به</th><th>ما يفعله طبيب الأسنان</th></tr>
</thead>
<tbody>
<tr><td><strong>1. المينا</strong></td><td>لا شيء. أحيانًا بقعة بيضاء أو بنّية</td><td>إعادة تمعدن، مراقبة، أو حشو صغير. جلسة قصيرة</td></tr>
<tr><td><strong>2. العاج</strong></td><td>حساسية للبرد والحرارة والحلو، تتوقّف سريعًا</td><td>تنظيف التجويف وحشوه (مركّب). جلسة واحدة</td></tr>
<tr><td><strong>3. اللبّ (التهاب اللبّ)</strong></td><td>ألم قويّ، متواصل، يُوقظ ليلًا: ألم الأسنان الحادّ</td><td><a href="/comment-traiter/carie-dentaire">سحب العصب</a>: تنظيف القنوات وحشوها، ثم إعادة بناء، غالبًا بتاج. عدّة جلسات</td></tr>
<tr><td><strong>4. التموّت و<a href="/blog/abces-dentaire-maroc">الخُراج</a></strong></td><td>ألم نابض، سنّ لا يُمَسّ، تورّم، وحمّى أحيانًا</td><td>تصريف ثم معالجة القناة، أو قلع إن لم يكن السنّ قابلًا للاستعادة</td></tr>
</tbody>
</table>

<p>هذا الجدول هو الحجّة المركزية للوقاية: بين الطور الأول والطور الرابع، لسنا بصدد معالجة مرض مختلف، بل المشكلة نفسها مأخوذة في أربع لحظات مختلفة — بفارق كبير في الوقت والانزعاج والكلفة.</p>

<h2>العلامات التي يجب أن تُنبّه</h2>

<ul>
<li><a href="/questions/dent-sensible-au-froid-et-au-chaud-pourquoi-et-comment-la-soulager">حساسية جديدة</a> للبرد أو الحرارة أو الحلو على سنّ محدّد.</li>
<li>بقعة بيضاء طباشيرية، أو بنّية، أو سوداء على المينا.</li>
<li>طعام يعلق دائمًا في الموضع نفسه، أو خيط سنّي يتشعّث دائمًا في الفراغ نفسه.</li>
<li>خشونة أو «حفرة» يكشفها اللسان.</li>
<li><a href="/symptomes/mauvaise-haleine">رائحة فم كريهة</a> موضعية، طعم سيّئ.</li>
<li>ألم عند المضغ، ولو كان قصيرًا.</li>
</ul>

<p>وحالتان مضلّلتان بشكل خاص. التسوّس <strong>بين سنّين</strong> لا يُرى في المرآة: الصورة الشعاعية وحدها تكشفه. والتسوّس <strong>تحت حشو قديم</strong> أو تحت تاج يتقدّم بعيدًا عن الأنظار. وهذا بالضبط ما تُفيده زيارة مراقبة سنوية عند شخص لا يؤلمه شيء.</p>

<h2>لماذا لا نحسّ به في البداية</h2>

<p>المينا لا تحتوي على أيّ نهايات عصبية: فإصابة تبقى محصورة فيها لا مؤلمة بحكم البنية. ولا تظهر الحساسية إلا ببلوغ العاج، المخترَق بقنيّات تنقل تغيّرات الحرارة. ولا يأتي الألم الصريح إلا عند اللبّ، حين يحدث الالتهاب في تجويف مغلق لا يمكنه التوسّع. بعبارة أخرى: <strong>ترتيب ظهور الأعراض يتبع عمق الإصابة</strong>، لا خطورتها الأوّلية. وانتظار الألم للاستشارة يعني بنيويًّا الوصول متأخّرًا.</p>

<h2>ما يمكن لطبيب الأسنان فعله، حسب اللحظة</h2>

<p>يجمع التشخيص بين الفحص السريري و<strong>الصورة الشعاعية</strong>، الضرورية للأوجه المخفية ولتقييم قرب العصب. ويتبع العلاج ما تمّ اكتشافه: إعادة تمعدن ومراقبة في إصابة مبتدئة؛ تنظيف ثم حشو حين يتشكّل التجويف؛ سحب عصب حين يُصاب العصب؛ إعادة بناء تعويضية حين لا يبقى ما يكفي من السنّ؛ وقلع كحلّ أخير، متبوعًا بمناقشة البديل — جسر، طقم، أو <a href="/questions/implant-dentaire-comment-ca-marche-et-combien-ca-coute-au-maroc">زرعة</a>.</p>

<p>ومن الناحية المالية، المنطق بسيط وقابل للتحقّق: كلّما كان الطور مبكّرًا، كان العمل أقصر وأخفّ. ولأن الأتعاب حرّة في القطاع الخاص، اطلب <strong>تسعيرًا مكتوبًا</strong> قبل أيّ عمل تعويضي، وموافقة مسبقة عند طلبها. وتُفصّل صفحتانا <a href="/prix">أسعار الأعمال الطبية في المغرب</a> و<a href="/remboursement-amo-cnss">التعويض AMO / CNSS</a> آلية الباقي على عاتقك، المحسوب على أساس التسعير الوطني المرجعي — وهو حاليًّا في طور المراجعة — لا على المبلغ المفوتَر.</p>

<h2>عند الطفل: أسنان اللبن مهمّة</h2>

<p>فكرة أن سنًّا لبنيًّا متسوّسًا «سيسقط في كل الأحوال» تكلّف غاليًا. فتسوّس سنّ لبني يؤلم، ويعيق التغذية، وقد يُخمَج على تماسّ مع بُرعم السنّ الدائم، كما أن الفقد المبكّر لسنّ لبني يُخلّ باصطفاف الأسنان التالية.</p>

<ul>
<li><strong>من أوّل سنّ</strong>، تنظيف بفرشاة ملائمة؛ ومعجون بالفلور بالجرعة الموصى بها للعمر، كما يحدّدها الممارس.</li>
<li><strong>لا قنّينة محلّاة عند النوم</strong> ولا مصّاصة مغموسة في العسل أو السكّر: فاللعاب يقلّ ليلًا، والهجمة الحمضية تدوم حتى الصباح.</li>
<li><strong>تفريش تحت إشراف</strong> شخص راشد إلى أن يتمكّن الطفل من الحركة، نحو 7 أو 8 سنوات عمومًا.</li>
<li><strong>زيارة أولى مبكّرة</strong>، ثم مراقبة منتظمة: فالرهان هو الكشف بقدر ما هو التعوّد على العيادة، ما يُجنّب الخوف من طبيب الأسنان في سنّ الرشد.</li>
<li>وفي حالة حمّى أو تورّم، انظر مقالنا <a href="/blog/fievre-enfant-que-faire-maroc">الحمّى عند الطفل</a> و<a href="/blog/sante-enfant-guide-maroc">دليلنا لصحة الطفل</a>.</li>
</ul>

<h2>بعد الستّين: تسوّس العنق</h2>

<p>عند المسنّ، يُغيّر التسوّس شكله. فلم يعد يتشكّل في قمّة السنّ بل في <strong>العنق</strong>، عند حدّ اللثة المتراجعة، على سطح جذر أقلّ تمعدنًا من المينا وبالتالي أكثر هشاشة. وتتراكم ثلاثة عوامل: تراجع اللثة المرتبط بـ<a href="/blog/parodontite-dechaussement-dents-maroc">أمراض دواعم السن</a>، و<strong>جفاف الفم</strong> الذي تُسبّبه أدوية عديدة طويلة الأمد — انظر <a href="/blog/polymedication-senior-maroc">تعدّد الأدوية عند المسنّ</a> — وصعوبة حركة التفريش المتزايدة.</p>

<p>وهذه التسوّسات تتطوّر سريعًا وتُهشّش السنّ في قاعدته، مع خطر كسر. وهي تبرّر تواترًا أضيق للمراقبة، وفُرَشًا بينيّة بدل الخيط عندما تتّسع الفراغات، ومعجونًا بنسبة فلور ملائمة برأي الممارس، والانتباه إلى التغذية — انظر <a href="/blog/nutrition-personne-agee-maroc">تغذية المسنّ</a>.</p>

<h2>الوقاية، بترتيب الفعالية</h2>

<ol>
<li><strong>تفريشان يوميًّا، دقيقتان، بمعجون يحتوي على الفلور.</strong> هذا هو الإجراء الأفضل إثباتًا. فالفلور يحمي المينا من الهجمات الحمضية ويُشجّع إعادة تمعدنها. فرشاة بشعيرات ناعمة، تُغيَّر كل ثلاثة أشهر تقريبًا، بحركة من اللثة نحو السنّ، دون إغفال الأوجه الداخلية ولا الأرحاء الأخيرة.</li>
<li><strong>التنظيف بين الأسنان، مرّة يوميًّا</strong> — خيط أو فُرَش بينيّة، تُختار مع الممارس حسب فراغاتك. فالفرشاة لا تنظّف الأوجه التي ينشأ فيها معظم التسوّس غير المرئي.</li>
<li><strong>تبعيد أوقات تناول السكّر</strong> أكثر من تقليله: الحدّ من التقميش، ومن الشاي شديد الحلاوة الذي يُرتشف طويلًا، ومن المشروبات الغازية والعصائر. وشرب الماء بعد تناول سكّر يساعد.</li>
<li><strong>مراقبة مرّة إلى مرّتين سنويًّا</strong>، حتى دون ألم، مع <a href="/questions/a-quelle-frequence-faire-un-detartrage-et-une-visite-de-controle">إزالة الجير</a> حسب الحاجة — وهذا ما يسمح بالعلاج في الطور الأول أو الثاني بدلًا من الثالث.</li>
<li><strong>عدم التدخين</strong>: التبغ والشيشة يُشجّعان <a href="/blog/parodontite-dechaussement-dents-maroc">أمراض اللثة</a>، التي تكشف الأعناق — وهي مناطق يستقرّ فيها التسوّس بسهولة. انظر <a href="/blog/arret-tabac-sevrage-maroc">الإقلاع عن التدخين</a>.</li>
<li><strong>الإبلاغ عن جفاف الفم</strong>: بعض الأدوية وبعض الأمراض تُقلّل اللعاب، أي الحماية الطبيعية. وعند الشخص <a href="/blog/diabete-type-2-maroc">المصاب بالسكري</a>، يزداد خطر التسوّس وعدوى اللثة.</li>
</ol>

<p>لمزيد من التفصيل: <a href="/prevenir/carie-dentaire">الوقاية من تسوّس الأسنان</a>، <a href="/prevenir/gingivite">الوقاية من أمراض اللثة</a>، وسؤال <a href="/questions/comment-prevenir-les-caries-et-garder-des-dents-saines">كيف نتّقي التسوّس</a>.</p>

<h2>ما لا يحمي</h2>

<ul>
<li><strong>التفريش بقوّة أكبر أو لمدّة أطول.</strong> التفريش العنيف يُبلي المينا ويُتلف اللثة؛ فالمهمّ التقنية والانتظام.</li>
<li><strong>المضمضات وحدها.</strong> لا تُغني عن أيّ عمل ميكانيكي.</li>
<li><strong>معاجين «التبييض» الكاشطة</strong> و<a href="/questions/blanchiment-des-dents-est-ce-sans-danger-pour-l-email-de-mes">التبييض</a> المتكرّر دون رأي طبّي: لا أثر وقائي لها على التسوّس.</li>
<li><strong>انتظار الألم.</strong> اللحظة الوحيدة التي يكون فيها التسوّس بسيط العلاج هي اللحظة التي لا يظهر فيها.</li>
</ul>

<h2>الخلاصة</h2>

<p>التسوّس مرض بطيء وصامت وقابل للتفادي، وتتوقّف كلفته النهائية شبه كليًّا على اللحظة التي نأخذه فيها. فتفريشان بالفلور يوميًّا، وتنظيف بين الأسنان كل يوم، وأقلّ من أوقات تناول السكّر، ومراقبة سنوية تكفي لتفادي الغالبية العظمى من العلاجات الثقيلة. وفي حال ألم مستقرّ، انظر دليلنا <a href="/blog/mal-de-dents-rage-de-dents-maroc">ألم الأسنان</a>؛ ولمعرفة من تستشير، صفحتنا <a href="/quel-medecin-pour/mal-de-dents">أيّ طبيب لألم الأسنان</a>.</p>

<hr>

<p>بقعة، أو حساسية، أو مجرّد مراقبة متأخّرة؟ على SantéauMaroc، <a href="/specialites/chirurgie-dentaire">اعثر على جرّاح أسنان قريب منك</a>، واطّلع على الملفات المتحقَّق منها وآراء المرضى، واحجز موعدك عبر الإنترنت بالمجان.</p>', 'تسوّس الأسنان: العلامات والعلاج والوقاية | المغرب', 'تسوّس الأسنان: الأطوار الأربعة والعلاجات المرتبطة بها، العلامات التي تُرصد بلا ألم، حالة الطفل والوقاية الفعّالة. دليل ملائم للمغرب.', 'التسوّس لا يؤلم في البداية: المينا بلا عصب. وانتظار الألم يعني الوصول إلى مرحلة سحب العصب.
ما يُتلف المينا هو تواتر تناول السكّر أكثر من كمّيته: الشاي شديد الحلاوة الذي يُرتشف طوال الصباح أسوأ من حلوى.
التسوّس المتشكّل لا يُغلق نفسه أبدًا؛ الطور المبتدئ وحده قابل لإعادة التمعدن.
التسوّس بين الأسنان وتحت الحشوات القديمة لا يُرى إلا في الصورة الشعاعية: هذه فائدة المراقبة السنوية بلا أعراض.
عند الطفل، يجب معالجة السنّ اللبني المتسوّس: فهو يؤلم، وقد يُخمَج، وفقده المبكّر يُخلّ بالاصطفاف.
الوقاية بترتيب الفعالية: تفريش بالفلور مرّتين × دقيقتان، خيط أو فُرَش بينيّة يوميًّا، أقلّ من السكّر، مراقبة سنوية.', '[{"q":"هل يمكن أن يُشفى التسوّس وحده؟","a":"إصابة مبتدئة جدًّا، محصورة في المينا، هي وحدها القابلة لإعادة التمعدن بفضل الفلور ونظافة صارمة. أما بمجرّد تشكّل تجويف، فلا تنقلب العملية: يتقدّم التسوّس ويستلزم علاجًا. ولهذا يُغيّر الكشف المبكّر كل شيء."},{"q":"كيف أعرف أن لديّ تسوّسًا دون ألم؟","a":"بعلامات غير مباشرة: بقعة بيضاء أو بنّية أو سوداء، حساسية جديدة للبرد أو الحلو على سنّ، طعام يعلق دائمًا في الموضع نفسه، خشونة يكشفها اللسان. أما التسوّس بين الأسنان فلا يُرى إلا في الصورة الشعاعية — ومن هنا أهمّية المراقبة السنوية."},{"q":"كم يستغرق التسوّس ليبلغ العصب؟","a":"الأمر متغيّر جدًّا: من بضعة أشهر إلى عدّة سنوات، حسب التغذية والنظافة وجودة اللعاب وموضع الإصابة. وقد يتطوّر التسوّس بسرعة عند طفل أو في حالة جفاف الفم، ويبقى مستقرًّا طويلًا عند شخص نظافته ممتازة."},{"q":"هل السكّر هو السبب الوحيد للتسوّس؟","a":"هو الوقود الرئيسي: فالجراثيم تحوّل السكّريات إلى أحماض تُذيب المينا. لكن عوامل أخرى تُثقّل الكفّة: تواتر التناول، النظافة، كمّية اللعاب وجودته، موضع الأسنان، التبغ، وبعض الأمراض والأدوية التي تُجفّف الفم."},{"q":"هل الفلور خطير؟","a":"بجرعات معاجين الأسنان، الفلور فعّال وآمن: وهو إجراء الوقاية من التسوّس الأفضل توثيقًا. والخطر يخصّ الجرعات المفرطة عند الطفل الصغير، ومن هنا أهمّية استعمال كمّية ملائمة للعمر يحدّدها جرّاح الأسنان، والإشراف على التفريش."},{"q":"هل يجب معالجة تسوّس في سنّ لبني؟","a":"نعم. فالسنّ اللبني المتسوّس مؤلم، وقد يُخمَج على تماسّ مع بُرعم السنّ الدائم، وفقده المبكّر يُخلّ باصطفاف الأسنان التالية. وحجّة «سيسقط في كل الأحوال» تؤدّي بانتظام إلى علاجات أثقل بعد ذلك."},{"q":"هل يمكن أن يتسوّس سنّ مسحوب العصب؟","a":"السنّ لا يشعر بالألم بعد ذلك، لكنه قد يتسوّس في أجزائه المتبقّية، خاصة تحت تاج أو عند العنق، كما قد تظهر العدوى مجدّدًا عند قمة الجذر. لذا يستلزم السنّ المسحوب العصب النظافة والمراقبة نفسها، بل أكثر."},{"q":"بأيّ تواتر يجب زيارة طبيب الأسنان بلا ألم؟","a":"مرّة إلى مرّتين سنويًّا لمعظم البالغين، مع إزالة جير حسب الحاجة. ويُضيَّق الإيقاع في حالة الخطر المرتفع: سكري، تبغ، جفاف الفم، مرض دواعم السن، سوابق تسوّسات متعدّدة، حمل، أو جهاز تقويم أسنان."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- chute-de-cheveux-maroc  (pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdhaha70000mcnp9bot0w2r', 'Chute de cheveux : causes, bilan et traitements qui marchent vraiment', 'chute-de-cheveux-maroc', 'Perdre 50 à 100 cheveux par jour est normal. Comment distinguer une chute passagère d''une alopécie durable, quel bilan permet d''en trouver la cause, et ce qu''on peut réellement attendre des traitements. Un guide complet adapté au Maroc.', '<p>Voir des cheveux sur l''oreiller, dans la brosse ou au fond de la douche inquiète presque tout le monde à un moment. Pourtant, <strong>perdre 50 à 100 cheveux par jour est normal</strong> : le cheveu pousse, se repose, tombe, et repousse. Le vrai sujet n''est donc pas la présence de cheveux dans le peigne, mais la <em>tendance</em> : est-ce que la chevelure s''éclaircit, est-ce que les golfes reculent, est-ce que la raie s''élargit ?</p>

<p>Cet article distingue les chutes passagères des chutes durables, détaille le bilan qu''un médecin réalise, et fait le tri entre les traitements dont l''efficacité est établie et les promesses commerciales. Il complète notre fiche <a href="/symptomes/chute-de-cheveux">chute de cheveux</a> et la question <a href="/questions/je-perds-beaucoup-mes-cheveux-est-ce-normal-et-que-faire">je perds beaucoup mes cheveux, est-ce normal ?</a></p>

<h2>Ce qui est normal, ce qui ne l''est pas</h2>

<p>Chaque cheveu suit un cycle de plusieurs années : une longue phase de croissance, une courte phase de transition, puis une phase de repos au terme de laquelle il tombe pour être remplacé. À tout moment, environ un cheveu sur dix est en fin de cycle — c''est ce renouvellement permanent qui explique la perte quotidienne physiologique.</p>

<p>Doivent en revanche faire consulter :</p>

<ul>
<li>une perte <strong>brutalement plus abondante</strong>, qui dure plus de deux à trois mois ;</li>
<li>un <strong>éclaircissement visible</strong> : cuir chevelu qui se voit au sommet, raie qui s''élargit, queue de cheval qui maigrit ;</li>
<li>un <strong>recul des golfes temporaux</strong> ou une tonsure au vertex chez l''homme ;</li>
<li>des <strong>plaques sans cheveux</strong>, nettes, apparues rapidement ;</li>
<li>une chute accompagnée de <strong>rougeurs, croûtes, douleur ou démangeaisons</strong> du cuir chevelu ;</li>
<li>une chute associée à d''autres signes : fatigue, prise ou perte de poids, règles irrégulières, pilosité inhabituelle.</li>
</ul>

<h2>Les grandes causes</h2>

<table>
<thead>
<tr><th>Cause</th><th>Ce qui la caractérise</th><th>Réversible ?</th></tr>
</thead>
<tbody>
<tr><td><strong>Alopécie androgénétique</strong></td><td>Évolution lente et progressive, terrain familial. Golfes et vertex chez l''homme, éclaircissement diffus du sommet chez la femme</td><td>Non spontanément ; ralentie par un traitement au long cours</td></tr>
<tr><td><strong>Chute réactionnelle</strong></td><td>Perte diffuse et abondante, 2 à 4 mois après un déclencheur : accouchement, fièvre élevée, chirurgie, régime restrictif, choc émotionnel, arrêt d''une contraception</td><td>Oui, le plus souvent en quelques mois</td></tr>
<tr><td><strong>Carences</strong></td><td><a href="/maladies/carence-en-fer">Manque de fer</a>, ferritine basse, apports insuffisants en protéines, régimes déséquilibrés</td><td>Oui, après correction</td></tr>
<tr><td><strong>Causes hormonales</strong></td><td><a href="/maladies/hypothyroidie">Thyroïde</a>, <a href="/maladies/syndrome-des-ovaires-polykystiques">SOPK</a>, ménopause, post-partum</td><td>Souvent, si la cause est traitée</td></tr>
<tr><td><strong>Pelade</strong> (alopécie en aires)</td><td>Plaques rondes, bien limitées, apparition rapide, cuir chevelu lisse</td><td>Souvent, mais évolution capricieuse — avis dermatologique</td></tr>
<tr><td><strong>Alopécie de traction</strong></td><td>Chute localisée aux zones tirées : lisière frontale, tempes. Tresses serrées, extensions, chignons tirés, défrisage, lissage répété</td><td>Oui si on arrête tôt ; définitive si le follicule est détruit</td></tr>
<tr><td><strong>Causes infectieuses</strong></td><td><a href="/maladies/teigne">Teigne</a> chez l''enfant : plaque squameuse avec cheveux cassés courts — contagieuse, à traiter</td><td>Oui, sous traitement</td></tr>
<tr><td><strong>Médicaments et maladies</strong></td><td>Chimiothérapie, certains traitements au long cours, <a href="/maladies/lupus">maladies inflammatoires</a></td><td>Variable, selon la cause</td></tr>
</tbody>
</table>

<h3>Chez l''homme</h3>

<p>La cause dominante est l''alopécie androgénétique, qui peut débuter dès la vingtaine. Le mécanisme est une sensibilité héritée du follicule aux hormones androgènes : le cheveu devient progressivement plus fin, plus court, moins pigmenté, jusqu''à ne plus émerger. Ce n''est pas une maladie du cuir chevelu et cela n''a rien à voir avec l''hygiène — mais l''évolution est <strong>progressive et continue</strong> sans prise en charge, ce qui explique l''intérêt de consulter tôt si l''on souhaite agir.</p>

<h3>Chez la femme</h3>

<p>Trois situations reviennent constamment. La chute du <strong>post-partum</strong>, qui débute deux à quatre mois après l''accouchement et se corrige presque toujours seule en quelques mois — voir notre article sur le <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>. La <strong>carence en fer</strong>, très fréquente chez la femme en âge de procréer, notamment en cas de règles abondantes : voir <a href="/blog/anemie-fer-carence-maroc">anémie par carence en fer</a> et <a href="/blog/aliments-riches-en-fer-maroc">aliments riches en fer</a>. Et les <strong>causes hormonales</strong> : <a href="/blog/hypothyroidie-maroc">hypothyroïdie</a>, <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">SOPK</a>, <a href="/blog/menopause-symptomes-solutions-maroc">ménopause</a>. Chez la femme, une chute qui s''accompagne d''acné et d''une pilosité inhabituelle oriente vers un bilan hormonal.</p>

<h3>L''alopécie de traction : un angle trop peu discuté</h3>

<blockquote>Tresses très serrées, extensions, tissages, chignons tirés, défrisage et lissage répétés exercent une tension permanente sur les follicules de la lisière. Le premier signe est un dégarnissement du contour frontal et des tempes, souvent avec de petits boutons douloureux à la racine. Pris tôt, il régresse. Prolongé des années, il devient <strong>définitif</strong> : le follicule est remplacé par du tissu cicatriciel et aucun traitement ne le fait repousser.</blockquote>

<p>Les mesures utiles sont simples : desserrer, alterner les coiffures, espacer les défrisages et les lissages thermiques, éviter de tresser sur cheveux fragilisés, et consulter dès que la lisière recule — pas quand elle a disparu.</p>

<h3>Cheveux couverts : ce qui compte vraiment</h3>

<p>Porter un foulard ne fait pas tomber les cheveux. Ce qui peut poser problème, ce sont deux habitudes associées : <strong>serrer</strong> — attache tendue, chignon tiré, épingles au même endroit tous les jours — et <strong>couvrir des cheveux encore humides</strong>, ce qui entretient une macération favorable aux <a href="/maladies/mycose-cutanee">mycoses</a> et aux irritations du cuir chevelu. Trois réflexes suffisent : sécher avant de couvrir, varier les points de tension et l''emplacement des épingles, et laisser le cuir chevelu respirer quand c''est possible. En cas de <a href="/symptomes/demangeaisons">démangeaisons</a>, de plaques ou d''odeur, il s''agit d''un problème de cuir chevelu à traiter — pas d''une fatalité.</p>

<h2>Le bilan : ce que cherche le médecin</h2>

<p>La démarche commence par un <strong>interrogatoire</strong> précis : depuis quand, comment (diffuse ou en plaques), antécédents familiaux, événements des six derniers mois, régimes, traitements, coiffures habituelles, cycle menstruel. Puis l''<strong>examen du cuir chevelu</strong> et des cheveux, parfois à l''aide d''une loupe éclairante (trichoscopie), qui distingue une chute diffuse d''une alopécie cicatricielle et repère une atteinte inflammatoire.</p>

<p>Selon l''orientation, une <strong>prise de sang</strong> cible ce qui est utile plutôt qu''un bilan tous azimuts : numération et ferritine pour le fer, TSH pour la thyroïde, parfois bilan hormonal chez la femme, vitamine D. Voir notre article <a href="/blog/analyse-de-sang-maroc">prise de sang : déroulé et résultats</a>. Un prélèvement mycologique est réalisé en cas de suspicion de teigne, et une biopsie du cuir chevelu reste réservée aux alopécies cicatricielles ou d''origine incertaine.</p>

<h2>Les traitements : ce qui marche, ce qui ne marche pas</h2>

<h3>D''abord, traiter la cause</h3>

<p>C''est l''étape la plus rentable et la plus souvent négligée. Corriger une carence en fer, équilibrer une thyroïde, prendre en charge un SOPK, arrêter une coiffure traumatisante, laisser passer une chute post-partum : dans tous ces cas, le cheveu repart sans qu''aucun produit capillaire n''y soit pour quelque chose.</p>

<h3>L''alopécie androgénétique</h3>

<p>Des traitements médicamenteux existent, avec un bénéfice réel mais des règles claires : ils se prescrivent après un diagnostic, leurs indications diffèrent selon le sexe et l''âge, le résultat s''évalue sur plusieurs mois, et l''effet <strong>disparaît à l''arrêt</strong> — c''est un traitement d''entretien, pas une cure. Certains sont formellement contre-indiqués en cas de grossesse ou de désir de grossesse. C''est au médecin d''en discuter avec vous, avec les effets indésirables possibles : ni le pharmacien de garde, ni un site de vente en ligne, ni un forum ne peuvent poser cette indication.</p>

<h3>La greffe de cheveux</h3>

<p>La greffe redistribue les cheveux d''une zone donneuse — généralement l''arrière du crâne, moins sensible aux androgènes — vers les zones dégarnies. Elle ne crée pas de cheveux et ne stoppe pas l''évolution de l''alopécie : sans traitement d''entretien, les cheveux d''origine autour de la greffe continuent de s''éclaircir. Elle suppose une zone donneuse suffisante, une alopécie stabilisée, et une évaluation honnête du résultat atteignable. Voir la question <a href="/questions/greffe-de-cheveux-au-maroc-comment-ca-se-passe-et-quel-resultat">greffe de cheveux au Maroc</a>.</p>

<h3>Compléments, huiles et « soins miracles »</h3>

<ul>
<li><strong>Les compléments alimentaires</strong> n''ont d''intérêt démontré que s''il existe une carence : supplémenter du fer sans carence ne fait pas repousser les cheveux et n''est pas anodin.</li>
<li><strong>Les huiles et massages</strong> peuvent améliorer le confort du cuir chevelu et l''aspect du cheveu ; ils ne modifient pas une alopécie androgénétique.</li>
<li><strong>Les shampooings « anti-chute »</strong> agissent sur le lavage, pas sur le cycle du cheveu. En cas de <a href="/questions/pellicules-et-cuir-chevelu-qui-demange-que-faire-pour-s-en-debarrasser">pellicules et démangeaisons</a>, un traitement adapté du cuir chevelu est utile — c''est une autre question que la chute.</li>
<li><strong>Méfiance sur les protocoles vendus en ligne</strong> sans consultation ni diagnostic, et sur les préparations dont la composition n''est pas connue.</li>
</ul>

<h2>Quand consulter</h2>

<p>Sans attendre, en cas de plaques sans cheveux, de cuir chevelu rouge, douloureux ou croûteux, de chute chez un enfant, ou d''une chute qui s''accompagne de signes généraux. Rapidement aussi si la lisière recule sur des zones tressées ou défrisées, parce que la fenêtre de réversibilité se referme. Et sans dramatiser, mais sans attendre non plus, si l''éclaircissement progresse : <strong>les traitements freinent l''évolution, ils ne ressuscitent pas un follicule disparu</strong>. Notre page <a href="/quel-medecin-pour/chute-de-cheveux">quel médecin consulter pour une chute de cheveux</a> précise vers qui vous tourner, et <a href="/comment-traiter/chute-de-cheveux">comment traiter une chute de cheveux</a> résume le parcours.</p>

<h2>En résumé</h2>

<p>Perdre des cheveux chaque jour est normal ; voir sa chevelure s''éclaircir ne l''est pas. La bonne démarche est d''identifier le mécanisme avant d''acheter quoi que ce soit : une chute réactionnelle se corrige seule, une carence se comble, une cause hormonale se traite, une alopécie de traction s''arrête en changeant de coiffure, et une alopécie androgénétique se ralentit — à condition de commencer tôt et de continuer.</p>

<hr>

<p>Une chute qui dure ou une lisière qui recule ? Sur SantéauMaroc, <a href="/specialites/dermatologie">trouvez un dermatologue près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>', '/blog-covers/post-chute-de-cheveux-maroc.jpg', 'Peigne portant des cheveux tombés', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 8, 'Chute de cheveux : causes et solutions', 'Chute de cheveux : ce qui est normal, les causes (hormones, fer, traction, pelade), le bilan utile et les traitements. Adapté au Maroc.', 'Perdre 50 à 100 cheveux par jour est normal : ce qui compte est l''éclaircissement, pas les cheveux dans le peigne.
Une chute diffuse survenant 2 à 4 mois après un accouchement, une fièvre, un régime ou un choc est réactionnelle et se corrige presque toujours seule.
Chez la femme, penser d''abord carence en fer, thyroïde, SOPK, post-partum et ménopause.
Tresses serrées, extensions et défrisages répétés provoquent une alopécie de traction : réversible au début, définitive après des années.
Les traitements de l''alopécie androgénétique freinent l''évolution mais perdent leur effet à l''arrêt ; certains sont contre-indiqués en cas de grossesse.
Plaques sans cheveux, cuir chevelu rouge ou douloureux, chute chez l''enfant : avis médical sans attendre.', '[{"q":"Combien de cheveux perd-on normalement par jour ?","a":"Entre 50 et 100, parce que chaque cheveu suit un cycle et qu''environ un sur dix est en fin de cycle à tout moment. La perte augmente naturellement à certaines périodes, notamment aux changements de saison. Le signe à surveiller n''est pas le nombre de cheveux tombés mais l''éclaircissement de la chevelure."},{"q":"Le stress fait-il vraiment tomber les cheveux ?","a":"Un choc émotionnel ou un stress intense peut déclencher une chute diffuse, qui apparaît typiquement deux à quatre mois après l''événement et se corrige le plus souvent seule en quelques mois. Le stress chronique, lui, aggrave plutôt qu''il ne cause. Voir notre article sur la gestion du stress."},{"q":"Ma chute de cheveux après l''accouchement est-elle normale ?","a":"Oui, c''est l''une des chutes les plus fréquentes : la baisse hormonale fait basculer d''un coup de nombreux cheveux en fin de cycle, deux à quatre mois après la naissance. Elle est spectaculaire mais transitoire et régresse en général en quelques mois. Un bilan de fer est utile si la fatigue s''y ajoute."},{"q":"Une carence en fer peut-elle faire tomber les cheveux ?","a":"Oui, et c''est une cause très fréquente chez la femme, en particulier en cas de règles abondantes ou d''alimentation pauvre en fer. Le dosage de la ferritine permet de l''objectiver. Attention toutefois : se supplémenter en fer sans carence prouvée n''a aucun bénéfice sur les cheveux et n''est pas sans risque."},{"q":"Les tresses et le défrisage abîment-ils les cheveux ?","a":"Ils peuvent provoquer une alopécie de traction : la tension permanente sur les follicules de la lisière frontale et des tempes finit par les détruire. Le premier signe est un contour qui recule, parfois avec de petits boutons à la racine. Pris tôt, cela régresse ; prolongé des années, le résultat devient définitif."},{"q":"Les compléments alimentaires font-ils repousser les cheveux ?","a":"Uniquement s''ils corrigent une carence réelle — fer, protéines, certaines vitamines. En l''absence de carence, aucun complément n''a démontré qu''il faisait repousser les cheveux, et certains dosages élevés sont déconseillés. Mieux vaut un bilan ciblé qu''une supplémentation à l''aveugle."},{"q":"La greffe de cheveux est-elle une solution définitive ?","a":"Elle déplace des cheveux d''une zone donneuse vers une zone dégarnie, mais elle n''en crée pas et n''arrête pas l''évolution de l''alopécie : les cheveux d''origine autour de la greffe continuent de s''éclaircir sans traitement d''entretien. Elle suppose une alopécie stabilisée, une zone donneuse suffisante et des attentes réalistes."},{"q":"Quand faut-il consulter pour une chute de cheveux ?","a":"Sans attendre en cas de plaques sans cheveux, de cuir chevelu rouge, croûteux ou douloureux, de chute chez un enfant, ou de signes associés comme une fatigue marquée ou des règles irrégulières. Et sans trop tarder si la chevelure s''éclaircit : les traitements ralentissent l''évolution mais ne font pas revenir un follicule disparu."}]', '[{"label":"Hair loss — causes, types d''alopécie et prise en charge","url":"https://www.nhs.uk/conditions/hair-loss/","publisher":"National Health Service (NHS)"},{"label":"Pilosité de la femme : ce qui est normal, ce qui l''est moins (hyperandrogénie, SOPK)","url":"https://www.ameli.fr/assure/sante/themes/pilosite-excessive-femme/definition-formes-causes","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Prise en charge des perruques et accessoires capillaires","url":"https://www.ameli.fr/assure/remboursements/rembourse/medicaments-vaccins-dispositifs-medicaux/remboursement-perruques","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Aménorrhée et troubles du cycle : quelles causes ?","url":"https://www.ameli.fr/assure/sante/themes/retard-absence-de-regles-ou-amenorrhee/amenorrhee-regles-retard-absence-0","publisher":"Assurance Maladie (ameli.fr)"}]', 'Alopécie', NULL, 'تساقط الشعر: الأسباب والفحص والعلاجات التي تنجح فعلًا', 'فقد 50 إلى 100 شعرة يوميًّا أمر طبيعي. كيف نفرّق بين تساقط عابر وثعلبة دائمة، وأيّ فحص يكشف السبب، وما يمكن توقّعه فعلًا من العلاجات. دليل كامل ملائم للمغرب.', '<p>رؤية شعر على الوسادة أو في الفرشاة أو في قاع الحمّام تُقلق شبه الجميع في لحظة ما. ومع ذلك، فـ<strong>فقد 50 إلى 100 شعرة يوميًّا أمر طبيعي</strong>: فالشعرة تنمو، ثم تستريح، ثم تسقط، ثم تنبت من جديد. لذا فالموضوع الحقيقي ليس وجود شعر في المشط، بل <em>الاتّجاه</em>: هل يتخفّف الشعر؟ هل تتراجع زوايا الجبهة؟ هل يتّسع خطّ الفرق؟</p>

<p>يفرّق هذا المقال بين التساقط العابر والتساقط الدائم، ويفصّل الفحص الذي يُجريه الطبيب، ويفرز بين العلاجات المُثبتة والوعود التجارية. وهو يكمّل بطاقتنا <a href="/symptomes/chute-de-cheveux">تساقط الشعر</a> وسؤال <a href="/questions/je-perds-beaucoup-mes-cheveux-est-ce-normal-et-que-faire">أفقد شعري بكثرة، هل هذا طبيعي؟</a></p>

<h2>ما هو الطبيعي وما ليس كذلك</h2>

<p>تتبع كل شعرة دورة تدوم سنوات: طور نموّ طويل، ثم طور انتقالي قصير، ثم طور راحة تسقط بعده لتُستبدَل. وفي كل لحظة، تكون شعرة من كل عشر في نهاية دورتها — وهذا التجدّد الدائم هو ما يفسّر الفقد اليومي الفيزيولوجي.</p>

<p>وفي المقابل، يجب أن تدفع إلى الاستشارة:</p>

<ul>
<li>خسارة <strong>أكثر غزارة بشكل مفاجئ</strong>، تدوم أكثر من شهرين إلى ثلاثة؛</li>
<li><strong>تخفّف ظاهر</strong>: فروة تُرى في أعلى الرأس، خطّ فرق يتّسع، ذيل حصان يَنقُص؛</li>
<li><strong>تراجع زوايا الجبهة</strong> أو منطقة صلعاء في أعلى الرأس عند الرجل؛</li>
<li><strong>بقع بلا شعر</strong>، واضحة الحدود، ظهرت بسرعة؛</li>
<li>تساقط مصحوب بـ<strong>احمرار أو قشور أو ألم أو حكّة</strong> في فروة الرأس؛</li>
<li>تساقط مصحوب بعلامات أخرى: تعب، زيادة أو نقص في الوزن، دورة شهرية غير منتظمة، شعر غير معتاد في مواضع أخرى.</li>
</ul>

<h2>الأسباب الكبرى</h2>

<table>
<thead>
<tr><th>السبب</th><th>ما يميّزه</th><th>قابل للرجوع؟</th></tr>
</thead>
<tbody>
<tr><td><strong>الثعلبة الأندروجينية</strong></td><td>تطوّر بطيء ومتدرّج، أرضية عائلية. زوايا الجبهة وأعلى الرأس عند الرجل، وتخفّف منتشر في الأعلى عند المرأة</td><td>لا تلقائيًّا؛ يُبطّئها علاج طويل الأمد</td></tr>
<tr><td><strong>تساقط تفاعلي</strong></td><td>خسارة منتشرة وغزيرة، بعد شهرين إلى أربعة من مُحرّض: ولادة، حمّى شديدة، عملية جراحية، نظام غذائي مُقيّد، صدمة نفسية، إيقاف مانع حمل</td><td>نعم، في أغلب الأحيان خلال أشهر</td></tr>
<tr><td><strong>العَوَز</strong></td><td><a href="/maladies/carence-en-fer">نقص الحديد</a>، فيريتين منخفض، نقص البروتينات، أنظمة غذائية غير متوازنة</td><td>نعم، بعد التصحيح</td></tr>
<tr><td><strong>أسباب هرمونية</strong></td><td><a href="/maladies/hypothyroidie">الغدة الدرقية</a>، <a href="/maladies/syndrome-des-ovaires-polykystiques">تكيّس المبايض</a>، سنّ اليأس، ما بعد الولادة</td><td>غالبًا، إن عُولج السبب</td></tr>
<tr><td><strong>الثعلبة البقعية</strong></td><td>بقع دائرية، واضحة الحدود، ظهور سريع، فروة ملساء</td><td>غالبًا، لكن التطوّر متقلّب — رأي أخصّائي الجلد</td></tr>
<tr><td><strong>ثعلبة الشدّ</strong></td><td>تساقط في المناطق المشدودة: خطّ الجبهة، الصدغان. ضفائر مشدودة، وصلات، كعكة مشدودة، تمليس أو فرد الشعر بشكل متكرّر</td><td>نعم إن توقّفنا مبكّرًا؛ ونهائي إن دُمّرت البصيلة</td></tr>
<tr><td><strong>أسباب خمجية</strong></td><td><a href="/maladies/teigne">القوباء الحلقية</a> عند الطفل: بقعة متقشّرة بشعر مكسور قصير — معدية، ويجب علاجها</td><td>نعم، تحت العلاج</td></tr>
<tr><td><strong>أدوية وأمراض</strong></td><td>معالجة كيميائية، بعض العلاجات طويلة الأمد، <a href="/maladies/lupus">أمراض التهابية</a></td><td>متغيّر، حسب السبب</td></tr>
</tbody>
</table>

<h3>عند الرجل</h3>

<p>السبب المهيمن هو الثعلبة الأندروجينية، التي قد تبدأ من العشرينيات. والآلية هي حساسية موروثة للبصيلة تجاه الهرمونات الأندروجينية: تصبح الشعرة تدريجيًّا أرقّ وأقصر وأقلّ تصبّغًا، إلى أن تكفّ عن الظهور. وهذا ليس مرضًا في فروة الرأس ولا علاقة له بالنظافة — لكن التطوّر <strong>متدرّج ومتواصل</strong> بدون تكفّل، وهذا ما يفسّر أهمّية الاستشارة مبكّرًا إن أردنا التحرّك.</p>

<h3>عند المرأة</h3>

<p>ثلاث حالات تتكرّر دائمًا. تساقط <strong>ما بعد الولادة</strong>، الذي يبدأ بعد شهرين إلى أربعة من الولادة ويُصحّح نفسه شبه دائمًا في أشهر — انظري مقالنا عن <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>. و<strong>نقص الحديد</strong>، الشائع جدًّا عند المرأة في سنّ الإنجاب، خاصة في حالة دورة غزيرة: انظري <a href="/blog/anemie-fer-carence-maroc">فقر الدم بعَوَز الحديد</a> و<a href="/blog/aliments-riches-en-fer-maroc">الأطعمة الغنية بالحديد</a>. و<strong>الأسباب الهرمونية</strong>: <a href="/blog/hypothyroidie-maroc">خمول الغدة الدرقية</a>، <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">تكيّس المبايض</a>، <a href="/blog/menopause-symptomes-solutions-maroc">سنّ اليأس</a>. وعند المرأة، تساقط مصحوب بحبّ الشباب وشعر غير معتاد يوجّه نحو فحص هرموني.</p>

<h3>ثعلبة الشدّ: زاوية لا تُناقَش بما يكفي</h3>

<blockquote>الضفائر الشديدة، والوصلات، والنسج، والكعكات المشدودة، والفرد والتمليس المتكرّران تمارس شدًّا دائمًا على بصيلات خطّ الشعر. والعلامة الأولى تخفّف في محيط الجبهة والصدغين، غالبًا مع بثور صغيرة مؤلمة عند الجذور. وإن أُخذ مبكّرًا تراجع. وإن استمرّ سنوات صار <strong>نهائيًّا</strong>: تُستبدَل البصيلة بنسيج تليّفي ولا يُنبتها أيّ علاج.</blockquote>

<p>والإجراءات المفيدة بسيطة: التخفيف من الشدّ، وتنويع التسريحات، وتبعيد أوقات الفرد والتمليس الحراري، وتجنّب الضفر على شعر مُتهالك، والاستشارة بمجرّد تراجع خطّ الشعر — لا بعد اختفائه.</p>

<h3>الشعر المغطّى: ما يهمّ فعلًا</h3>

<p>حمل غطاء للرأس لا يُسقط الشعر. ما قد يطرح مشكلة هو عادتان مرتبطتان به: <strong>الشدّ</strong> — ربطة مشدودة، كعكة مسحوبة، مشابك في الموضع نفسه كل يوم — و<strong>تغطية شعر ما زال رطبًا</strong>، ما يُبقي رطوبة مواتية لـ<a href="/maladies/mycose-cutanee">الفطريات</a> وتهيّجات فروة الرأس. وثلاثة ردود تكفي: التجفيف قبل التغطية، وتنويع نقاط الشدّ وموضع المشابك، وترك فروة الرأس تتنفّس عند الإمكان. وفي حالة <a href="/symptomes/demangeaisons">حكّة</a> أو بقع أو رائحة، فالأمر مشكلة في فروة الرأس تجب معالجتها — لا أمر مقضيّ.</p>

<h2>الفحص: ما يبحث عنه الطبيب</h2>

<p>تبدأ المقاربة بـ<strong>استجواب</strong> دقيق: من متى، وكيف (منتشر أم في بقع)، والسوابق العائلية، وأحداث الأشهر الستّة الأخيرة، والأنظمة الغذائية، والأدوية، والتسريحات المعتادة، والدورة الشهرية. ثم <strong>فحص فروة الرأس</strong> والشعر، أحيانًا بمكبّرة مُضاءة (تنظير الشعر)، وهو ما يفرّق بين تساقط منتشر وثعلبة تليّفية ويرصد إصابة التهابية.</p>

<p>وحسب التوجيه، يستهدف <strong>تحليل الدم</strong> ما هو مفيد بدلًا من فحص شامل بلا هدف: تعداد الدم والفيريتين للحديد، وTSH للغدة الدرقية، وأحيانًا فحص هرموني عند المرأة، وفيتامين D. انظر مقالنا <a href="/blog/analyse-de-sang-maroc">تحليل الدم: المجرى والنتائج</a>. ويُجرى أخذ عيّنة للفطريات في حال الشكّ في القوباء الحلقية، وتبقى خزعة فروة الرأس محفوظة للثعلبات التليّفية أو ذات المنشأ غير المؤكّد.</p>

<h2>العلاجات: ما ينجح وما لا ينجح</h2>

<h3>أوّلًا، معالجة السبب</h3>

<p>هذه هي المرحلة الأكثر مردودية والأكثر إغفالًا. فتصحيح عَوَز الحديد، وموازنة الغدة الدرقية، والتكفّل بتكيّس المبايض، وإيقاف تسريحة مؤذية، وترك تساقط ما بعد الولادة يمرّ: في كل هذه الحالات، يعود الشعر دون أن يكون لأيّ منتج للشعر دور في ذلك.</p>

<h3>الثعلبة الأندروجينية</h3>

<p>توجد علاجات دوائية، بفائدة حقيقية لكن بقواعد واضحة: تُوصف بعد تشخيص، وتختلف استطباباتها حسب الجنس والعمر، وتُقيَّم النتيجة على عدّة أشهر، ويزول الأثر <strong>عند التوقّف</strong> — فهو علاج صيانة لا دورة علاجية. وبعضها ممنوع بشكل قاطع في حالة الحمل أو الرغبة في الحمل. والطبيب هو من يناقش ذلك معك، مع الآثار غير المرغوبة المحتملة: فلا صيدلي المداومة، ولا موقع بيع عبر الإنترنت، ولا منتدى يمكنه وضع هذا الاستطباب.</p>

<h3>زرع الشعر</h3>

<p>الزرع يُعيد توزيع الشعر من منطقة مانحة — مؤخّرة الرأس عمومًا، وهي أقلّ حساسية للأندروجينات — نحو المناطق المتخفّفة. وهو لا يُنشئ شعرًا ولا يوقف تطوّر الثعلبة: فبدون علاج صيانة، يتابع الشعر الأصلي حول الزرع تخفّفه. وهو يفترض منطقة مانحة كافية، وثعلبة مستقرّة، وتقييمًا صادقًا للنتيجة الممكنة. انظر سؤال <a href="/questions/greffe-de-cheveux-au-maroc-comment-ca-se-passe-et-quel-resultat">زرع الشعر في المغرب</a>.</p>

<h3>المكمّلات والزيوت و«العلاجات المعجزة»</h3>

<ul>
<li><strong>المكمّلات الغذائية</strong> لا فائدة مُثبتة لها إلا إن وُجد عَوَز: فتناول الحديد دون عَوَز لا يُنبت الشعر وليس بلا خطر.</li>
<li><strong>الزيوت والتدليك</strong> قد تُحسّن راحة فروة الرأس ومظهر الشعرة؛ لكنها لا تُغيّر ثعلبة أندروجينية.</li>
<li><strong>شامبوهات «مضادّ التساقط»</strong> تعمل على الغسل، لا على دورة الشعرة. وفي حالة <a href="/questions/pellicules-et-cuir-chevelu-qui-demange-que-faire-pour-s-en-debarrasser">قشرة وحكّة</a>، يكون علاج فروة الرأس الملائم مفيدًا — وهي مسألة مختلفة عن التساقط.</li>
<li><strong>حذرٌ من البروتوكولات المُباعة عبر الإنترنت</strong> دون استشارة ولا تشخيص، ومن التركيبات التي لا تُعرف مكوّناتها.</li>
</ul>

<h2>متى نستشير</h2>

<p>دون تأخير، في حالة بقع بلا شعر، أو فروة حمراء أو مؤلمة أو متقشّرة، أو تساقط عند طفل، أو تساقط مصحوب بعلامات عامة. وسريعًا كذلك إذا تراجع خطّ الشعر في مناطق مضفورة أو مفرودة، لأن نافذة الرجوع تُغلَق. ودون تهويل، لكن دون تأخير أيضًا، إذا كان التخفّف يتقدّم: <strong>فالعلاجات تُبطّئ التطوّر، ولا تُحيي بصيلة اختفت</strong>. وتوضّح صفحتنا <a href="/quel-medecin-pour/chute-de-cheveux">أيّ طبيب تستشير لتساقط الشعر</a> إلى من تتوجّه، ويلخّص <a href="/comment-traiter/chute-de-cheveux">كيف نعالج تساقط الشعر</a> المسار.</p>

<h2>الخلاصة</h2>

<p>فقد شعر كل يوم أمر طبيعي؛ أما رؤية الشعر يتخفّف فلا. والمقاربة الصحيحة هي تحديد الآلية قبل شراء أيّ شيء: فالتساقط التفاعلي يُصحّح نفسه، والعَوَز يُعوَّض، والسبب الهرموني يُعالَج، وثعلبة الشدّ تتوقّف بتغيير التسريحة، والثعلبة الأندروجينية تُبطَّأ — بشرط البدء مبكّرًا والمواصلة.</p>

<hr>

<p>تساقط يدوم أو خطّ شعر يتراجع؟ على SantéauMaroc، <a href="/specialites/dermatologie">اعثر على طبيب جلد قريب منك</a>، واطّلع على الملفات المتحقَّق منها وآراء المرضى، واحجز موعدك عبر الإنترنت بالمجان.</p>', 'تساقط الشعر: الأسباب والحلول | المغرب', 'تساقط الشعر: ما هو الطبيعي، الأسباب الكبرى (هرمونات، حديد، شدّ، ثعلبة بقعية)، الفحص المفيد والعلاجات الفعّالة. دليل ملائم للمغرب.', 'فقد 50 إلى 100 شعرة يوميًّا أمر طبيعي: ما يهمّ هو التخفّف، لا الشعر في المشط.
تساقط منتشر يظهر بعد شهرين إلى أربعة من ولادة أو حمّى أو نظام غذائي أو صدمة هو تفاعلي ويُصحّح نفسه شبه دائمًا.
عند المرأة، يجب التفكير أوّلًا في نقص الحديد والغدة الدرقية وتكيّس المبايض وما بعد الولادة وسنّ اليأس.
الضفائر الشديدة والوصلات والفرد المتكرّر تُسبّب ثعلبة شدّ: قابلة للرجوع في البداية، نهائية بعد سنوات.
علاجات الثعلبة الأندروجينية تُبطّئ التطوّر لكن يزول أثرها عند التوقّف؛ وبعضها ممنوع في حالة الحمل.
بقع بلا شعر، فروة حمراء أو مؤلمة، تساقط عند طفل: رأي طبّي دون تأخير.', '[{"q":"كم شعرة نفقد عادةً في اليوم؟","a":"بين 50 و100، لأن كل شعرة تتبع دورة ولأن نحو واحدة من كل عشر تكون في نهاية دورتها في أيّ لحظة. ويزيد الفقد طبيعيًّا في فترات معيّنة، خاصة عند تغيّر الفصول. والعلامة التي يجب مراقبتها ليست عدد الشعرات المتساقطة بل تخفّف الشعر."},{"q":"هل الضغط النفسي يُسقط الشعر فعلًا؟","a":"صدمة نفسية أو ضغط شديد قد يُطلق تساقطًا منتشرًا، يظهر نمطيًّا بعد شهرين إلى أربعة من الحادث ويُصحّح نفسه في الغالب خلال أشهر. أما الضغط المزمن فيُفاقم أكثر من أن يُسبّب. انظر مقالنا عن تدبير الضغط النفسي."},{"q":"هل تساقط شعري بعد الولادة طبيعي؟","a":"نعم، وهو من أكثر أنواع التساقط شيوعًا: فالهبوط الهرموني يدفع عددًا كبيرًا من الشعرات إلى نهاية دورتها دفعة واحدة، بعد شهرين إلى أربعة من الولادة. وهو مثير للانتباه لكنه عابر ويتراجع عمومًا في أشهر. ويكون فحص الحديد مفيدًا إذا أُضيف إليه تعب."},{"q":"هل يمكن لنقص الحديد أن يُسقط الشعر؟","a":"نعم، وهو سبب شائع جدًّا عند المرأة، خاصة في حالة دورة غزيرة أو تغذية فقيرة بالحديد. ويسمح قياس الفيريتين بإثباته. لكن انتبه: تناول مكمّلات الحديد دون عَوَز مُثبت لا فائدة له على الشعر وليس بلا خطر."},{"q":"هل تُتلف الضفائر والفرد الشعر؟","a":"قد تُسبّب ثعلبة شدّ: فالشدّ الدائم على بصيلات خطّ الجبهة والصدغين ينتهي بتدميرها. والعلامة الأولى تراجع في المحيط، أحيانًا مع بثور صغيرة عند الجذور. وإن أُخذ الأمر مبكّرًا تراجع؛ وإن استمرّ سنوات صارت النتيجة نهائية."},{"q":"هل تُنبت المكمّلات الغذائية الشعر؟","a":"فقط إن صحّحت عَوَزًا حقيقيًّا — حديد، بروتينات، بعض الفيتامينات. وفي غياب العَوَز، لم يُثبت أيّ مكمّل أنه يُنبت الشعر، وبعض الجرعات المرتفعة غير مستحسنة. ففحص مستهدف أفضل من مكمّلات على العشواء."},{"q":"هل زرع الشعر حلّ نهائي؟","a":"إنه يُنقل شعرًا من منطقة مانحة إلى منطقة متخفّفة، لكنه لا يُنشئ شعرًا ولا يوقف تطوّر الثعلبة: فالشعر الأصلي حول الزرع يتابع تخفّفه دون علاج صيانة. وهو يفترض ثعلبة مستقرّة ومنطقة مانحة كافية وتوقّعات واقعية."},{"q":"متى يجب استشارة الطبيب لتساقط الشعر؟","a":"دون تأخير في حالة بقع بلا شعر، أو فروة حمراء أو متقشّرة أو مؤلمة، أو تساقط عند طفل، أو علامات مصاحبة كتعب ملحوظ أو دورة غير منتظمة. ودون تأخير كبير إذا كان الشعر يتخفّف: فالعلاجات تُبطّئ التطوّر لكنها لا تُعيد بصيلة اختفت."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- acne-maroc  (pilier)
INSERT INTO posts ("id", "title", "slug", "excerpt", "content", "coverImage", "coverAlt", "categoryId", "authorId", "reviewedById", "reviewedAt", "status", "publishedAt", "readingTime", "metaTitle", "metaDesc", "keyTakeaways", "faqJson", "sources", "aboutEntity", "pillarId", "titleAr", "excerptAr", "contentAr", "metaTitleAr", "metaDescAr", "keyTakeawaysAr", "faqJsonAr", "arReviewedAt", "updatedAt")
VALUES ('cmsdhahax0001mcnpjlcx4lzr', 'Acné : comprendre, traiter et éviter les cicatrices', 'acne-maroc', 'L''acné n''est pas un défaut d''hygiène et ne se règle pas en attendant. Le mécanisme, les formes selon leur gravité, les gestes qui aggravent, les traitements efficaces et leur encadrement, et comment éviter les cicatrices. Guide adapté au Maroc.', '<p>L''acné n''est pas un défaut d''hygiène, ni une fatalité de l''adolescence qu''il faudrait « attendre ». C''est une <strong>maladie inflammatoire du follicule pilo-sébacé</strong>, fréquente, traitable, et dont la prise en charge précoce a un enjeu très concret : éviter les cicatrices, qui sont bien plus difficiles à corriger que les boutons eux-mêmes.</p>

<p>Cet article explique le mécanisme, distingue les formes selon leur gravité, liste les gestes qui aggravent — dont deux très répandus au Maroc — et décrit les traitements réellement efficaces ainsi que leur encadrement. Il complète notre fiche <a href="/maladies/acne">acné</a> et la question <a href="/questions/comment-traiter-l-acne-de-l-adolescent">comment traiter l''acné de l''adolescent</a>.</p>

<h2>Ce qui provoque l''acné</h2>

<p>Chaque pore de la peau abrite un follicule pilo-sébacé : un poil et une glande sébacée qui produit le sébum, film protecteur naturel. Quatre mécanismes s''enchaînent :</p>

<ol>
<li><strong>Une production excessive de sébum</strong> (hyperséborrhée), sous influence hormonale — d''où le pic à l''adolescence et les poussées liées au cycle chez la femme. La peau devient brillante et grasse sur le front, le nez, les joues, le menton.</li>
<li><strong>Un bouchon de kératine</strong> obstrue le canal : c''est le comédon, ouvert (point noir) ou fermé (microkyste blanchâtre).</li>
<li><strong>Une prolifération bactérienne</strong> dans ce milieu fermé et riche en sébum.</li>
<li><strong>Une inflammation</strong> : le bouton rouge (papule), le bouton à tête blanche (pustule), puis dans les formes sévères le nodule et le kyste profonds — ceux qui laissent des cicatrices.</li>
</ol>

<p>Deux idées reçues méritent d''être écartées. L''acné n''est <strong>pas</strong> un problème de propreté : se laver plus souvent ou plus fort agresse la barrière cutanée et aggrave l''inflammation. Et aucun aliment isolé n''a été identifié comme cause : les données actuelles suggèrent un effet modeste des régimes très sucrés à index glycémique élevé, sans rien de comparable à l''influence hormonale et génétique.</p>

<h2>Les formes, et pourquoi la distinction compte</h2>

<table>
<thead>
<tr><th>Forme</th><th>Ce qu''on voit</th><th>Risque de cicatrices</th></tr>
</thead>
<tbody>
<tr><td><strong>Rétentionnelle</strong></td><td>Points noirs et microkystes, peau grasse, peu de rougeur</td><td>Faible</td></tr>
<tr><td><strong>Inflammatoire légère à modérée</strong></td><td>Papules et pustules rouges, sur une partie du visage</td><td>Modéré</td></tr>
<tr><td><strong>Sévère, nodulaire ou kystique</strong></td><td>Lésions profondes, douloureuses, étendues au dos et au torse</td><td><strong>Élevé</strong> — avis dermatologique rapide</td></tr>
</tbody>
</table>

<p>Cette distinction commande le traitement : une acné rétentionnelle relève de soins locaux, une acné sévère justifie un traitement général sans attendre, parce que chaque mois d''inflammation profonde laisse des marques définitives.</p>

<h2>Les erreurs qui aggravent</h2>

<ul>
<li><strong>Percer et gratter.</strong> C''est le raccourci le plus coûteux : l''inflammation s''aggrave, le risque de cicatrice et de tache pigmentaire augmente nettement, surtout sur les peaux foncées.</li>
<li><strong>Décaper la peau</strong> : savons agressifs, gommages répétés, alcool. La barrière cutanée s''abîme et la glande sébacée compense.</li>
<li><strong>Les crèmes éclaircissantes</strong> pour effacer les taches. Beaucoup contiennent des dérivés cortisonés ou de l''hydroquinone à forte dose : elles provoquent une acné induite, un amincissement de la peau, des taches paradoxales, et des complications générales quand l''usage est prolongé sur de grandes surfaces. Voir <a href="/questions/les-cremes-eclaircissantes-pour-la-peau-sont-elles-dangereuses">les crèmes éclaircissantes sont-elles dangereuses ?</a></li>
<li><strong>Les crèmes à la cortisone utilisées sans prescription</strong> : effet flatteur en quelques jours, rebond et aggravation ensuite. Voir <a href="/blog/corticoides-maroc">corticoïdes : bon usage</a>.</li>
<li><strong>Les cosmétiques occlusifs</strong> et les fonds de teint épais qui ferment les pores ; préférer les produits non comédogènes.</li>
<li><strong>Arrêter le traitement trop tôt.</strong> Un traitement anti-acné s''évalue sur deux à trois mois, et une phase d''irritation initiale ne signifie pas qu''il ne marche pas.</li>
<li><strong>Les antibiotiques pris seuls, longtemps, sans avis.</strong> Voir <a href="/blog/antibiotiques-maroc">le bon usage des antibiotiques</a>.</li>
</ul>

<h2>Les traitements</h2>

<h3>Les soins de base, pour tout le monde</h3>

<p>Un nettoyage doux une à deux fois par jour avec un produit adapté, une hydratation non comédogène, une protection solaire — plusieurs traitements anti-acné rendent la peau photosensible — et de la patience. Ces mesures ne suffisent pas seules dans les formes inflammatoires, mais aucun traitement ne fonctionne bien sans elles. Voir <a href="/questions/comment-se-proteger-du-soleil-au-maroc-et-prevenir-le-cancer-de">comment se protéger du soleil au Maroc</a>.</p>

<h3>Les traitements locaux</h3>

<p>Ils constituent la base des formes légères à modérées et agissent sur le bouchon, la bactérie et l''inflammation. Ils demandent une application régulière et prolongée, avec une irritation initiale fréquente qui s''atténue. C''est le médecin qui choisit la molécule, la concentration et le rythme selon le type de peau et la forme d''acné.</p>

<h3>Les traitements par voie orale</h3>

<p>Dans les formes inflammatoires résistantes aux traitements locaux, un traitement oral est ajouté, sur une durée limitée et sous surveillance. Chez la femme, une prise en charge hormonale est parfois discutée quand l''acné s''inscrit dans un tableau plus large — voir <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">SOPK</a>.</p>

<h3>L''isotrétinoïne : très efficace, très encadrée</h3>

<blockquote>Réservée aux acnés sévères ou résistantes, l''isotrétinoïne orale change le pronostic de formes qui laisseraient sinon des cicatrices majeures. Son encadrement est strict et non négociable : <strong>prescription initiale par un dermatologue</strong>, information écrite, surveillance biologique, et chez la femme en âge de procréer un <strong>programme de prévention des grossesses</strong> — contraception efficace débutée avant le traitement, tests de grossesse avant, chaque mois pendant, puis après l''arrêt. Le risque de malformations en cas de grossesse sous traitement est majeur. Ce médicament ne se partage jamais, ne s''achète pas sans ordonnance et ne se reprend pas sur une ancienne prescription.</blockquote>

<h2>Les cicatrices : prévenir d''abord</h2>

<p>Deux marques différentes sont souvent confondues. Les <strong>taches pigmentaires</strong> rouges ou brunes qui suivent un bouton ne sont pas des cicatrices : elles s''estompent en quelques mois, plus lentement sur les peaux foncées, et la photoprotection accélère leur disparition. Les <strong>vraies cicatrices</strong>, en creux ou en relief, correspondent à une perte de tissu et ne disparaissent pas seules.</p>

<p>Leur traitement — peelings, lasers, micro-needling, injections — améliore l''aspect sans effacer complètement, se discute sur une acné stabilisée, et demande plusieurs séances. Autrement dit : le meilleur traitement des cicatrices reste le traitement précoce de l''acné. Voir <a href="/questions/cicatrices-d-acne-quels-traitements-marchent-vraiment-pour-les-attenue">quels traitements marchent vraiment contre les cicatrices d''acné</a>.</p>

<h2>Situations particulières</h2>

<ul>
<li><strong>L''acné de la femme adulte</strong>, souvent localisée au bas du visage, mâchoire et menton, avec des poussées prémenstruelles. Elle justifie un bilan si elle s''accompagne de règles irrégulières, d''une pilosité inhabituelle ou d''une <a href="/blog/chute-de-cheveux-maroc">chute de cheveux</a>.</li>
<li><strong>Pendant la grossesse</strong> : plusieurs traitements anti-acné sont contre-indiqués, y compris certains produits locaux. Signalez toute grossesse ou tout projet de grossesse avant de commencer ou de poursuivre un traitement — voir <a href="/blog/suivi-grossesse-maroc">suivi de grossesse</a>.</li>
<li><strong>Chez l''adolescent</strong> : l''impact psychologique est réel et ne doit pas être minimisé. Une acné qui retentit sur l''humeur, les relations ou la scolarité est en soi une raison de consulter, quelle que soit son étendue.</li>
<li><strong>Le sport et la transpiration</strong> n''aggravent pas l''acné en eux-mêmes ; une douche après l''effort et des vêtements respirants suffisent.</li>
</ul>

<h2>L''acné du dos et du torse</h2>

<p>Elle est plus fréquente chez l''homme et l''adolescent, et souvent négligée parce qu''elle se voit moins. C''est une erreur : les lésions y sont volontiers plus profondes et plus inflammatoires, donc plus cicatricielles, et la peau du dos est plus épaisse — ce qui rend les traitements locaux moins commodes et fait recourir plus vite à un traitement général. Quelques mesures aident : doucher après le sport, éviter les vêtements serrés et non respirants sur une peau moite, laver les tenues de sport après chaque usage, et ne pas frotter les lésions avec des gants de crin ou des gommages abrasifs.</p>

<h2>Lire une étiquette de cosmétique</h2>

<p>Le mot à chercher est <strong>« non comédogène »</strong>, et le réflexe utile est la simplicité : moins de produits, textures fluides plutôt qu''occlusives, et une introduction un produit à la fois pour identifier ce qui déclenche une poussée. Les huiles végétales pures appliquées largement sur le visage, les baumes épais et les fonds de teint couvrants entretiennent souvent l''acné rétentionnelle. Un point souvent oublié : ce qui touche le visage compte aussi — téléphone, taies d''oreiller, casque, mains.</p>

<h2>L''acné du nouveau-né et du jeune enfant</h2>

<p>De petits boutons sur le visage d''un nouveau-né dans les premières semaines sont fréquents et bénins : ils régressent seuls, sans traitement ni produit particulier, et ne préjugent en rien de l''acné à l''adolescence. En revanche, une acné qui apparaît chez un enfant plus grand, avant la puberté, n''est pas banale : elle justifie un avis médical, notamment pour rechercher une cause hormonale ou l''application de produits inadaptés. Voir notre <a href="/blog/sante-enfant-guide-maroc">guide de la santé de l''enfant</a>.</p>

<h2>Quand consulter un dermatologue</h2>

<p>Sans attendre en cas de lésions profondes, douloureuses, étendues au dos ou au torse, ou de premières cicatrices. Également si les soins bien conduits ne donnent rien après deux à trois mois, si l''acné revient dès l''arrêt du traitement, si elle apparaît ou s''aggrave à l''âge adulte, ou si elle pèse sur le moral. Notre page <a href="/quel-medecin-pour/acne">quel médecin consulter pour l''acné</a> et <a href="/comment-traiter/acne">comment traiter l''acné</a> résument le parcours.</p>

<h2>En résumé</h2>

<p>L''acné se traite, et se traite mieux tôt. La logique est la même à tous les stades : ne pas percer, ne pas décaper, ne pas se soigner avec des crèmes éclaircissantes ou cortisonées, tenir un traitement assez longtemps pour le juger, et consulter dès que les lésions sont profondes ou qu''une cicatrice apparaît. Ce qui est irréversible n''est pas le bouton, c''est la cicatrice qu''il laisse.</p>

<hr>

<p>Une acné qui résiste ou qui laisse des marques ? Sur SantéauMaroc, <a href="/specialites/dermatologie">trouvez un dermatologue près de chez vous</a>, consultez les profils vérifiés et les avis patients, et prenez rendez-vous en ligne gratuitement.</p>', '/blog-covers/post-acne-maroc.jpg', 'Visage présentant des lésions d''acné inflammatoire sur la joue', (SELECT id FROM post_categories WHERE slug = 'maladies-traitements'), (SELECT id FROM users WHERE role = 'ADMIN' AND "isActive" = true ORDER BY "createdAt" LIMIT 1), (SELECT id FROM users WHERE email = 'redaction@santeaumaroc.com'), now(), 'PUBLISHED', now(), 8, 'Acné : traitements et erreurs à éviter', 'Acné : causes réelles, erreurs qui aggravent (percer, crèmes éclaircissantes), traitements, isotrétinoïne encadrée et cicatrices. Au Maroc.', 'L''acné est une maladie inflammatoire du follicule, pas un défaut d''hygiène : se laver plus fort l''aggrave.
Ce qui est irréversible n''est pas le bouton mais la cicatrice : une acné nodulaire ou kystique justifie un avis dermatologique rapide.
Ne jamais percer : c''est le principal facteur de cicatrices et de taches, surtout sur peau foncée.
Crèmes éclaircissantes et crèmes à la cortisone sans prescription induisent et aggravent l''acné.
Un traitement anti-acné s''évalue sur 2 à 3 mois ; l''irritation initiale n''est pas un échec.
L''isotrétinoïne est très efficace mais strictement encadrée : prescription dermatologique, contraception et tests de grossesse obligatoires chez la femme en âge de procréer.', '[{"q":"L''acné est-elle liée à un manque d''hygiène ?","a":"Non. C''est une maladie inflammatoire du follicule pilo-sébacé, déterminée surtout par les hormones et le terrain génétique. Se laver plus souvent ou avec des produits agressifs abîme la barrière cutanée et aggrave l''inflammation. Un nettoyage doux une à deux fois par jour suffit."},{"q":"Le chocolat et les aliments gras donnent-ils des boutons ?","a":"Aucun aliment isolé n''a été démontré comme cause de l''acné. Les données actuelles suggèrent un effet modeste des alimentations très sucrées à index glycémique élevé, sans commune mesure avec le rôle des hormones. Une alimentation équilibrée est utile pour la santé globale, ce n''est pas un traitement de l''acné."},{"q":"Faut-il percer ses boutons ?","a":"Non, jamais. Percer aggrave l''inflammation, augmente nettement le risque de cicatrice définitive et de tache pigmentaire, particulièrement sur les peaux foncées, et peut surinfecter la lésion. L''extraction de certains microkystes se fait au cabinet, avec un matériel adapté."},{"q":"Combien de temps faut-il pour qu''un traitement anti-acné agisse ?","a":"Il faut compter deux à trois mois pour juger un traitement, avec souvent une phase d''irritation ou une aggravation apparente les premières semaines. Arrêter au bout de dix jours parce que « ça ne marche pas » est l''erreur la plus fréquente. Un traitement d''entretien est ensuite souvent nécessaire."},{"q":"Les crèmes éclaircissantes peuvent-elles effacer les taches d''acné ?","a":"Elles sont surtout dangereuses. Beaucoup contiennent des dérivés cortisonés ou de l''hydroquinone à forte dose, qui induisent une acné, amincissent la peau, provoquent des taches paradoxales et, en usage prolongé sur de grandes surfaces, des complications générales. Les taches post-acné s''estompent seules avec une bonne photoprotection."},{"q":"Le soleil améliore-t-il l''acné ?","a":"Il donne une impression d''amélioration à court terme, en masquant les rougeurs et en asséchant la peau, suivie d''une aggravation quelques semaines plus tard. Par ailleurs, plusieurs traitements anti-acné rendent la peau photosensible : la protection solaire fait partie du traitement, pas du confort."},{"q":"L''isotrétinoïne est-elle dangereuse ?","a":"C''est un traitement très efficace des acnés sévères, mais strictement encadré : prescription initiale par un dermatologue, surveillance biologique, et chez la femme en âge de procréer contraception efficace et tests de grossesse avant, pendant chaque mois et après l''arrêt, en raison d''un risque majeur de malformations. Il ne se partage jamais et ne se reprend pas sur une ancienne ordonnance."},{"q":"Pourquoi ai-je de l''acné à 30 ans ?","a":"L''acné de la femme adulte est fréquente, souvent localisée au bas du visage avec des poussées avant les règles. Elle peut être favorisée par des facteurs hormonaux, certains cosmétiques ou médicaments. Un bilan est justifié si elle s''accompagne de règles irrégulières, d''une pilosité inhabituelle ou d''une chute de cheveux."}]', '[{"label":"Définition, symptômes et évolution de l''acné","url":"https://www.ameli.fr/assure/sante/themes/acne/definition-symptomes-evolution","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Acné : consultation et traitement","url":"https://www.ameli.fr/assure/sante/themes/acne/traitement","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Acné : que faire et quand consulter ?","url":"https://www.ameli.fr/assure/sante/themes/acne/bons-reflexes-bons-gestes","publisher":"Assurance Maladie (ameli.fr)"},{"label":"Traitement contre l''acné : règles de bon usage de l''isotrétinoïne pour limiter les risques","url":"https://ansm.sante.fr/actualites/traitement-contre-lacne-regles-de-bon-usage-de-lisotretinoine-pour-limiter-les-risques","publisher":"ANSM"},{"label":"Isotrétinoïne orale et traitement de l''acné sévère : actions pour réduire les risques","url":"https://ansm.sante.fr/dossiers-thematiques/isotretinoine-orale-et-traitement-de-lacne-severe/les-actions-mises-en-oeuvre-pour-reduire-les-risques-associes-a-lisotretinoine","publisher":"ANSM"}]', 'Acné', NULL, 'حبّ الشباب: الفهم والعلاج وتفادي الآثار', 'حبّ الشباب ليس نقصًا في النظافة ولا يُحلّ بالانتظار. الآلية، الأشكال حسب خطورتها، الأفعال التي تُفاقم الحالة، العلاجات الفعّالة وإطارها، وكيف نتفادى الآثار. ملائم للمغرب.', '<p>حبّ الشباب ليس نقصًا في النظافة، ولا حتميّةً من حتميّات المراهقة يجب «انتظار» انقضائها. إنه <strong>مرض التهابي يصيب الجُريب الشعري الدهني</strong>، شائع وقابل للعلاج، وللتكفّل به مبكّرًا رهان ملموس جدًّا: تفادي الآثار، وهي أصعب تصحيحًا بكثير من البثور نفسها.</p>

<p>يشرح هذا المقال الآلية، ويفرّق بين الأشكال حسب خطورتها، ويُحصي الأفعال التي تُفاقم الحالة — ومنها فعلان شائعان جدًّا في المغرب — ويصف العلاجات الفعّالة فعلًا وإطارها التنظيمي. وهو يكمّل بطاقتنا <a href="/maladies/acne">حبّ الشباب</a> وسؤال <a href="/questions/comment-traiter-l-acne-de-l-adolescent">كيف نعالج حبّ الشباب عند المراهق</a>.</p>

<h2>ما يُسبّب حبّ الشباب</h2>

<p>كل مسمّ في الجلد يحتضن جُريبًا شعريًّا دهنيًّا: شعرة وغدّة دهنية تُفرز الزُّهم، وهو الغشاء الواقي الطبيعي. وتتسلسل أربع آليات:</p>

<ol>
<li><strong>إفراز مفرط للزُّهم</strong>، بتأثير هرموني — ومن هنا الذروة في المراهقة والنوبات المرتبطة بالدورة عند المرأة. فيصبح الجلد لمّاعًا ودهنيًّا على الجبهة والأنف والوجنتين والذقن.</li>
<li><strong>سدادة من الكيراتين</strong> تسدّ القناة: هذا هو الرأس، المفتوح (رأس أسود) أو المغلق (كيس صغير أبيض).</li>
<li><strong>تكاثر جرثومي</strong> في هذا الوسط المغلق والغنيّ بالزُّهم.</li>
<li><strong>التهاب</strong>: الحُبيبة الحمراء، ثم البثرة ذات الرأس الأبيض، ثم في الأشكال الشديدة العُقيدة والكيس العميقان — وهما اللذان يتركان آثارًا.</li>
</ol>

<p>وفكرتان شائعتان تستحقّان الاستبعاد. حبّ الشباب <strong>ليس</strong> مشكلة نظافة: فالغسل الأكثر تكرارًا أو الأقوى يُتلف الحاجز الجلدي ويُفاقم الالتهاب. ولم يُحدَّد أيّ غذاء بمفرده كسبب: تشير المعطيات الحالية إلى أثر متواضع للأنظمة الغذائية شديدة الحلاوة ذات المؤشّر السكري المرتفع، بلا ما يُقارن بالتأثير الهرموني والوراثي.</p>

<h2>الأشكال، ولماذا يهمّ التفريق</h2>

<table>
<thead>
<tr><th>الشكل</th><th>ما نراه</th><th>خطر الآثار</th></tr>
</thead>
<tbody>
<tr><td><strong>احتباسي</strong></td><td>رؤوس سوداء وأكياس صغيرة، جلد دهني، احمرار قليل</td><td>ضعيف</td></tr>
<tr><td><strong>التهابي خفيف إلى متوسّط</strong></td><td>حُبيبات وبثور حمراء، على جزء من الوجه</td><td>متوسّط</td></tr>
<tr><td><strong>شديد، عُقيدي أو كيسي</strong></td><td>إصابات عميقة، مؤلمة، ممتدّة إلى الظهر والصدر</td><td><strong>مرتفع</strong> — رأي أخصّائي الجلد سريعًا</td></tr>
</tbody>
</table>

<p>وهذا التفريق هو ما يحدّد العلاج: فحبّ الشباب الاحتباسي يخصّ العلاجات الموضعية، أما الشديد فيبرّر علاجًا عامًّا دون تأخير، لأن كل شهر من الالتهاب العميق يترك علامات نهائية.</p>

<h2>الأخطاء التي تُفاقم الحالة</h2>

<ul>
<li><strong>العصر والخربشة.</strong> هذا أكثر الطرق المختصرة تكلفةً: يتفاقم الالتهاب، ويزيد خطر الأثر والبقعة الصبغية بوضوح، خاصة على الجلود الداكنة.</li>
<li><strong>تقشير الجلد بعنف</strong>: صابون قاسٍ، مقشّرات متكرّرة، كحول. فيتلف الحاجز الجلدي وتُعوّض الغدّة الدهنية.</li>
<li><strong>كريمات التبييض</strong> لمحو البقع. كثير منها يحتوي على مشتقّات الكورتيزون أو على الهيدروكينون بجرعات مرتفعة: فتُحدث حبّ شباب مُستحدَثًا، وترقّقًا في الجلد، وبقعًا معاكسة، ومضاعفات عامة عند الاستعمال المطوّل على مساحات واسعة. انظر <a href="/questions/les-cremes-eclaircissantes-pour-la-peau-sont-elles-dangereuses">هل كريمات التبييض خطيرة؟</a></li>
<li><strong>كريمات الكورتيزون المستعملة دون وصفة</strong>: أثر مُطمئن في أيام، ثم ارتداد وتفاقم بعد ذلك. انظر <a href="/blog/corticoides-maroc">الكورتيزون: الاستعمال الرشيد</a>.</li>
<li><strong>مستحضرات التجميل الساتّة للمسام</strong> وكريمات الأساس الكثيفة التي تُغلق المسام؛ يُفضَّل استعمال منتجات غير مسدّة للمسام.</li>
<li><strong>إيقاف العلاج مبكّرًا جدًّا.</strong> يُقيَّم علاج حبّ الشباب على شهرين إلى ثلاثة، وطور التهيّج الأوّلي لا يعني أنه لا ينجح.</li>
<li><strong>المضادات الحيوية وحدها، لمدّة طويلة، دون رأي طبّي.</strong> انظر <a href="/blog/antibiotiques-maroc">الاستعمال الرشيد للمضادات الحيوية</a>.</li>
</ul>

<h2>العلاجات</h2>

<h3>العناية الأساسية، للجميع</h3>

<p>تنظيف لطيف مرّة إلى مرّتين يوميًّا بمنتج ملائم، وترطيب غير مسدّ للمسام، وحماية من الشمس — فعدّة علاجات لحبّ الشباب تجعل الجلد أكثر حساسية للضوء — والصبر. وهذه الإجراءات لا تكفي وحدها في الأشكال الالتهابية، لكن لا علاج يعمل جيّدًا بدونها. انظر <a href="/questions/comment-se-proteger-du-soleil-au-maroc-et-prevenir-le-cancer-de">كيف نحمي أنفسنا من الشمس في المغرب</a>.</p>

<h3>العلاجات الموضعية</h3>

<p>تُشكّل أساس الأشكال الخفيفة إلى المتوسّطة، وتعمل على السدادة والجرثومة والالتهاب. وتستلزم تطبيقًا منتظمًا ومطوّلًا، مع تهيّج أوّلي شائع يخبو بعد ذلك. والطبيب هو من يختار الجزيء والتركيز والإيقاع حسب نوع الجلد وشكل حبّ الشباب.</p>

<h3>العلاجات الفموية</h3>

<p>في الأشكال الالتهابية المقاومة للعلاجات الموضعية، يُضاف علاج فموي، لمدّة محدودة وتحت مراقبة. وعند المرأة، يُناقَش أحيانًا تكفّل هرموني عندما يندرج حبّ الشباب في صورة أوسع — انظري <a href="/blog/syndrome-ovaires-polykystiques-sopk-maroc">تكيّس المبايض</a>.</p>

<h3>الإيزوتريتينوين: فعّال جدًّا ومُقنَّن جدًّا</h3>

<blockquote>مخصّص لحبّ الشباب الشديد أو المقاوم، يُغيّر الإيزوتريتينوين الفموي مآل أشكال كانت ستترك آثارًا كبيرة. وإطاره صارم وغير قابل للتفاوض: <strong>وصفة أوّلية من طبيب جلد</strong>، وإعلام مكتوب، ومراقبة مخبرية، وعند المرأة في سنّ الإنجاب <strong>برنامج للوقاية من الحمل</strong> — مانع حمل فعّال يُبدأ قبل العلاج، واختبارات حمل قبله وكل شهر خلاله ثم بعد التوقّف. وخطر التشوّهات في حالة حمل تحت العلاج كبير جدًّا. وهذا الدواء لا يُتقاسَم أبدًا، ولا يُشترى دون وصفة، ولا يُعاد تناوله بناءً على وصفة قديمة.</blockquote>

<h2>الآثار: الوقاية أوّلًا</h2>

<p>غالبًا ما تُخلَط علامتان مختلفتان. فـ<strong>البقع الصبغية</strong> الحمراء أو البنّية التي تتبع بثرة ليست آثارًا: إنها تخبو في أشهر، وببطء أكبر على الجلود الداكنة، والحماية من الشمس تُسرّع زوالها. أما <strong>الآثار الحقيقية</strong>، الغائرة أو البارزة، فتقابل فقدًا في النسيج ولا تزول وحدها.</p>

<p>وعلاجها — تقشير، ليزر، تحفيز بالإبر الدقيقة، حقن — يُحسّن المظهر دون محو كامل، ويُناقَش على حبّ شباب مستقرّ، ويستلزم عدّة جلسات. بعبارة أخرى: أفضل علاج للآثار هو علاج حبّ الشباب مبكّرًا. انظر <a href="/questions/cicatrices-d-acne-quels-traitements-marchent-vraiment-pour-les-attenue">أيّ علاجات تنجح فعلًا ضدّ آثار حبّ الشباب</a>.</p>

<h2>حبّ الشباب في الظهر والصدر</h2>

<p>هو أكثر شيوعًا عند الرجل والمراهق، وغالبًا ما يُهمَل لأنه أقلّ ظهورًا. وهذا خطأ: فالإصابات فيه أعمق وأكثر التهابًا عادةً، أي أكثر إحداثًا للآثار، وجلد الظهر أكثر سماكة — ما يجعل العلاجات الموضعية أقلّ ملاءمة ويدفع إلى اللجوء أسرع إلى علاج عامّ. وبعض الإجراءات تساعد: الاستحمام بعد الرياضة، وتجنّب الملابس الضيّقة وغير المنفّسة على جلد متعرّق، وغسل ملابس الرياضة بعد كل استعمال، وعدم فرك الإصابات بليفة خشنة أو مقشّرات كاشطة.</p>

<h2>قراءة ملصق مستحضر تجميل</h2>

<p>الكلمة التي يجب البحث عنها هي <strong>«غير مسدّ للمسام»</strong>، والردّ المفيد هو البساطة: منتجات أقلّ، وقوام سائل بدلًا من الساتّ، وإدخال منتج واحد في كل مرّة لتحديد ما يُطلق نوبة. والزيوت النباتية الخالصة المطبَّقة بسخاء على الوجه، والبلسمات الكثيفة، وكريمات الأساس المُغطّية، تُبقي غالبًا حبّ الشباب الاحتباسي. ونقطة كثيرًا ما تُنسى: ما يلمس الوجه يهمّ أيضًا — الهاتف، أغلفة الوسائد، الخوذة، اليدان.</p>

<h2>حبّ الشباب عند الوليد والطفل الصغير</h2>

<p>بثور صغيرة على وجه وليد في الأسابيع الأولى أمر شائع وحميد: تتراجع وحدها، دون علاج ولا منتج خاص، ولا تُنبئ بشيء عن حبّ الشباب في المراهقة. وفي المقابل، حبّ شباب يظهر عند طفل أكبر، قبل البلوغ، ليس عاديًّا: فهو يبرّر رأيًا طبّيًّا، خاصة للبحث عن سبب هرموني أو عن تطبيق منتجات غير ملائمة. انظر <a href="/blog/sante-enfant-guide-maroc">دليلنا لصحة الطفل</a>.</p>

<h2>حالات خاصة</h2>

<ul>
<li><strong>حبّ الشباب عند المرأة الراشدة</strong>، الموضَّع غالبًا في أسفل الوجه، الفكّ والذقن، بنوبات قبل الدورة. ويبرّر فحصًا إذا صاحبته دورة غير منتظمة، أو شعر غير معتاد، أو <a href="/blog/chute-de-cheveux-maroc">تساقط شعر</a>.</li>
<li><strong>خلال الحمل</strong>: عدّة علاجات لحبّ الشباب ممنوعة، بما فيها بعض المنتجات الموضعية. أبلِغي عن أيّ حمل أو مشروع حمل قبل بدء علاج أو متابعته — انظري <a href="/blog/suivi-grossesse-maroc">تتبّع الحمل</a>.</li>
<li><strong>عند المراهق</strong>: الأثر النفسي حقيقي ولا يجب التقليل منه. فحبّ شباب ينعكس على المزاج أو العلاقات أو الدراسة هو في ذاته سبب للاستشارة، أيًّا كان امتداده.</li>
<li><strong>الرياضة والتعرّق</strong> لا يُفاقمان حبّ الشباب بذاتهما؛ فيكفي الاستحمام بعد المجهود وملابس منفّسة.</li>
</ul>

<h2>متى نستشير طبيب الجلد</h2>

<p>دون تأخير في حالة إصابات عميقة، مؤلمة، ممتدّة إلى الظهر أو الصدر، أو ظهور أوّل الآثار. وكذلك إذا لم تُعطِ العناية المُحسنة نتيجة بعد شهرين إلى ثلاثة، أو إذا عاد حبّ الشباب بمجرّد إيقاف العلاج، أو إذا ظهر أو تفاقم في سنّ الرشد، أو إذا أثقل المعنويات. وتلخّص صفحتانا <a href="/quel-medecin-pour/acne">أيّ طبيب تستشير لحبّ الشباب</a> و<a href="/comment-traiter/acne">كيف نعالج حبّ الشباب</a> المسار.</p>

<h2>الخلاصة</h2>

<p>حبّ الشباب يُعالَج، ويُعالَج بشكل أفضل مبكّرًا. والمنطق هو نفسه في كل الأطوار: لا تعصر، لا تُقشّر بعنف، لا تتداوَ بكريمات التبييض أو الكورتيزون، واصمد على علاج مدّة كافية للحكم عليه، واستشر بمجرّد أن تصبح الإصابات عميقة أو يظهر أثر. فما لا رجعة فيه ليس البثرة، بل الأثر الذي تتركه.</p>

<hr>

<p>حبّ شباب يقاوم أو يترك علامات؟ على SantéauMaroc، <a href="/specialites/dermatologie">اعثر على طبيب جلد قريب منك</a>، واطّلع على الملفات المتحقَّق منها وآراء المرضى، واحجز موعدك عبر الإنترنت بالمجان.</p>', 'حبّ الشباب: العلاجات وأخطاء يجب تفاديها | المغرب', 'حبّ الشباب: الأسباب الحقيقية، الأخطاء التي تُفاقمه (العصر، كريمات التبييض)، العلاجات، الإيزوتريتينوين المُقنَّن والآثار. ملائم للمغرب.', 'حبّ الشباب مرض التهابي للجُريب، لا نقص نظافة: والغسل الأقوى يُفاقمه.
ما لا رجعة فيه ليس البثرة بل الأثر: حبّ شباب عُقيدي أو كيسي يبرّر رأي طبيب جلد سريعًا.
لا تعصر أبدًا: هذا هو العامل الرئيسي للآثار والبقع، خاصة على الجلد الداكن.
كريمات التبييض وكريمات الكورتيزون دون وصفة تُحدث حبّ الشباب وتُفاقمه.
علاج حبّ الشباب يُقيَّم على شهرين إلى ثلاثة؛ والتهيّج الأوّلي ليس فشلًا.
الإيزوتريتينوين فعّال جدًّا لكنه مُقنَّن بصرامة: وصفة من طبيب جلد، ومانع حمل واختبارات حمل إلزامية عند المرأة في سنّ الإنجاب.', '[{"q":"هل حبّ الشباب مرتبط بنقص النظافة؟","a":"لا. إنه مرض التهابي للجُريب الشعري الدهني، تحدّده أساسًا الهرمونات والأرضية الوراثية. والغسل الأكثر تكرارًا أو بمنتجات قاسية يُتلف الحاجز الجلدي ويُفاقم الالتهاب. ويكفي تنظيف لطيف مرّة إلى مرّتين يوميًّا."},{"q":"هل الشوكولاتة والأطعمة الدهنية تُسبّب البثور؟","a":"لم يُثبَت أيّ غذاء بمفرده كسبب لحبّ الشباب. وتشير المعطيات الحالية إلى أثر متواضع للتغذية شديدة الحلاوة ذات المؤشّر السكري المرتفع، بلا مقارنة بدور الهرمونات. والتغذية المتوازنة مفيدة للصحة عمومًا، لكنها ليست علاجًا لحبّ الشباب."},{"q":"هل يجب عصر البثور؟","a":"لا، أبدًا. العصر يُفاقم الالتهاب، ويزيد بوضوح خطر الأثر النهائي والبقعة الصبغية، خاصة على الجلود الداكنة، وقد يُخمج الإصابة. أما إخراج بعض الأكياس الصغيرة فيُنجَز في العيادة بأدوات ملائمة."},{"q":"كم من الوقت يستغرق علاج حبّ الشباب حتى يعمل؟","a":"يجب حساب شهرين إلى ثلاثة للحكم على علاج، مع طور تهيّج أو تفاقم ظاهري في الأسابيع الأولى غالبًا. والإيقاف بعد عشرة أيام لأن «العلاج لا ينجح» هو الخطأ الأكثر شيوعًا. ثم يكون علاج صيانة لازمًا في الغالب."},{"q":"هل يمكن لكريمات التبييض محو بقع حبّ الشباب؟","a":"إنها خطيرة أساسًا. فكثير منها يحتوي على مشتقّات الكورتيزون أو على الهيدروكينون بجرعات مرتفعة، ما يُحدث حبّ شباب، ويُرقّق الجلد، ويُسبّب بقعًا معاكسة، ومضاعفات عامة عند الاستعمال المطوّل على مساحات واسعة. أما بقع ما بعد حبّ الشباب فتخبو وحدها مع حماية جيّدة من الشمس."},{"q":"هل تُحسّن الشمس حبّ الشباب؟","a":"تعطي إحساسًا بالتحسّن على المدى القصير، بإخفاء الاحمرار وتجفيف الجلد، يتبعه تفاقم بعد أسابيع. كما أن عدّة علاجات لحبّ الشباب تجعل الجلد أكثر حساسية للضوء: فالحماية من الشمس جزء من العلاج، لا من الرفاهية."},{"q":"هل الإيزوتريتينوين خطير؟","a":"إنه علاج فعّال جدًّا لحبّ الشباب الشديد، لكنه مُقنَّن بصرامة: وصفة أوّلية من طبيب جلد، ومراقبة مخبرية، وعند المرأة في سنّ الإنجاب مانع حمل فعّال واختبارات حمل قبل العلاج وكل شهر خلاله وبعد التوقّف، بسبب خطر كبير للتشوّهات. ولا يُتقاسَم أبدًا ولا يُعاد تناوله بناءً على وصفة قديمة."},{"q":"لماذا أُصاب بحبّ الشباب في الثلاثين؟","a":"حبّ الشباب عند المرأة الراشدة شائع، وموضَّع غالبًا في أسفل الوجه بنوبات قبل الدورة. وقد تُشجّعه عوامل هرمونية أو بعض مستحضرات التجميل أو الأدوية. ويكون الفحص مبرّرًا إذا صاحبته دورة غير منتظمة، أو شعر غير معتاد، أو تساقط شعر."}]', now(), now())
ON CONFLICT (slug) DO UPDATE SET
  "title" = EXCLUDED."title",
  "excerpt" = EXCLUDED."excerpt",
  "content" = EXCLUDED."content",
  "coverImage" = EXCLUDED."coverImage",
  "coverAlt" = EXCLUDED."coverAlt",
  "categoryId" = EXCLUDED."categoryId",
  "reviewedById" = EXCLUDED."reviewedById",
  "reviewedAt" = EXCLUDED."reviewedAt",
  "status" = EXCLUDED."status",
  "readingTime" = EXCLUDED."readingTime",
  "metaTitle" = EXCLUDED."metaTitle",
  "metaDesc" = EXCLUDED."metaDesc",
  "keyTakeaways" = EXCLUDED."keyTakeaways",
  "faqJson" = EXCLUDED."faqJson",
  "sources" = EXCLUDED."sources",
  "aboutEntity" = EXCLUDED."aboutEntity",
  "pillarId" = EXCLUDED."pillarId",
  "titleAr" = EXCLUDED."titleAr",
  "excerptAr" = EXCLUDED."excerptAr",
  "contentAr" = EXCLUDED."contentAr",
  "metaTitleAr" = EXCLUDED."metaTitleAr",
  "metaDescAr" = EXCLUDED."metaDescAr",
  "keyTakeawaysAr" = EXCLUDED."keyTakeawaysAr",
  "faqJsonAr" = EXCLUDED."faqJsonAr",
  "publishedAt" = COALESCE(posts."publishedAt", EXCLUDED."publishedAt"),
  "arReviewedAt" = COALESCE(posts."arReviewedAt", EXCLUDED."arReviewedAt"),
  "updatedAt" = now();

-- ─── 2. Maillage retour fiches → articles piliers ───
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['abces-dentaire-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'abces-dentaire' AND kind = 'DISEASE';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['acne-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'acne' AND kind = 'DISEASE';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['mal-de-dents-rage-de-dents-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'bruxisme' AND kind = 'DISEASE';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['carie-dentaire-maroc', 'mal-de-dents-rage-de-dents-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'carie-dentaire' AND kind = 'DISEASE';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['chute-de-cheveux-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'chute-de-cheveux' AND kind = 'SYMPTOM';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['dent-de-sagesse-extraction-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'dent-de-sagesse' AND kind = 'SYMPTOM';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['parodontite-dechaussement-dents-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'gingivite' AND kind = 'DISEASE';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['mal-de-dents-rage-de-dents-maroc', 'abces-dentaire-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'mal-de-dents' AND kind = 'SYMPTOM';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['parodontite-dechaussement-dents-maroc', 'carie-dentaire-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'mauvaise-haleine' AND kind = 'SYMPTOM';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['parodontite-dechaussement-dents-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'saignement-des-gencives' AND kind = 'SYMPTOM';
UPDATE health_topics SET "relatedSlugs" = "relatedSlugs" || ARRAY(SELECT s FROM unnest(ARRAY['chute-de-cheveux-maroc']::text[]) AS s WHERE NOT (s = ANY("relatedSlugs"))), "updatedAt" = now() WHERE slug = 'teigne' AND kind = 'DISEASE';

-- ─── 3. Sources du glossaire (session 1) ───
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Acné »","url":"https://www.ameli.fr/assure/sante/themes/acne","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'acne';
UPDATE glossary_terms SET sources = '[{"label":"Caisse Nationale de Sécurité Sociale — « AMO, Assurance Maladie Obligatoire »","url":"https://www.cnss.ma/fr/assure/salarie/amo/informations-generale-amo","publisher":"CNSS Maroc"}]', "updatedAt" = now() WHERE slug = 'amo';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Anémie »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/anaemia","publisher":"OMS"},{"label":"Assurance Maladie — « Anémie par carence en fer »","url":"https://www.ameli.fr/assure/sante/themes/anemie-par-carence-en-fer","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'anemie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Bien utiliser les anti-inflammatoires non stéroïdiens »","url":"https://www.ameli.fr/assure/sante/medicaments/utiliser-recycler-medicaments/utiliser-anti-inflammatoires","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'anti-inflammatoire';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Résistance aux antimicrobiens »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/antimicrobial-resistance","publisher":"OMS"},{"label":"Assurance Maladie — « Bien utiliser les antibiotiques »","url":"https://www.ameli.fr/assure/sante/medicaments/utiliser-recycler-medicaments/bien-utiliser-les-antibiotiques/antibiotiques-et-antibioresistance","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'antibiotique';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Anticoagulants : importance du suivi »","url":"https://www.ameli.fr/assure/sante/medicaments/comprendre-les-differents-medicaments/anticoagulants","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'anticoagulant';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Médicaments pour le traitement de la dépression »","url":"https://www.msdmanuals.com/fr/accueil/troubles-mentaux/troubles-de-l-humeur/m%C3%A9dicaments-pour-le-traitement-de-la-d%C3%A9pression","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'antidepresseur';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Allergies et antihistaminiques »","url":"https://www.ameli.fr/assure/sante/themes/allergie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'antihistaminique';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Traitement de l''hypertension artérielle »","url":"https://www.ameli.fr/assure/sante/themes/hypertension-arterielle-hta","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'antihypertenseur';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Artériopathie oblitérante des membres inférieurs »","url":"https://www.ameli.fr/assure/sante/themes/arteriopathie-obliterante-arterite-des-membres-inferieurs","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'artere';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Arthrose »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/osteoarthritis","publisher":"OMS"},{"label":"Assurance Maladie — « Arthrose du genou »","url":"https://www.ameli.fr/assure/sante/themes/arthrose-genou","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'arthrose';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Asthme »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/asthma","publisher":"OMS","year":"2026"}]', "updatedAt" = now() WHERE slug = 'asthme';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Maladies cardiovasculaires »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)","publisher":"OMS","year":"2025"}]', "updatedAt" = now() WHERE slug = 'avc';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Tests médicaux fréquents »","url":"https://www.msdmanuals.com/fr/accueil/ressources/tests-m%C3%A9dicaux-fr%C3%A9quents/tests-m%C3%A9dicaux-fr%C3%A9quents","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'biopsie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Bronchite »","url":"https://www.ameli.fr/assure/sante/themes/bronchite","publisher":"ameli.fr"},{"label":"Assurance Maladie — « Bronchite aiguë »","url":"https://www.ameli.fr/assure/sante/themes/bronchite","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'bronchite';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Cancer du sein »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/breast-cancer","publisher":"OMS","year":"2026"}]', "updatedAt" = now() WHERE slug = 'cancer-du-sein';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Cécité et déficience visuelle »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/blindness-and-visual-impairment","publisher":"OMS"},{"label":"Assurance Maladie — « Cataracte »","url":"https://www.ameli.fr/assure/sante/themes/cataracte","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'cataracte';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Céphalées »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/headache-disorders","publisher":"OMS"},{"label":"Assurance Maladie — « Mal de tête »","url":"https://www.ameli.fr/assure/sante/themes/mal-tete","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'cephalee';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Chimiothérapie et autres traitements systémiques du cancer »","url":"https://www.msdmanuals.com/fr/accueil/cancer/pr%C3%A9vention-et-traitement-du-cancer/chimioth%C3%A9rapie-et-autres-traitements-syst%C3%A9miques-du-cancer","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'chimiotherapie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Insuffisance cardiaque »","url":"https://www.ameli.fr/assure/sante/themes/insuffisance-cardiaque","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'coeur';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule une coloscopie ? »","url":"https://www.ameli.fr/assure/sante/examen/exploration/deroulement-coloscopie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'coloscopie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Conjonctivite »","url":"https://www.ameli.fr/assure/sante/themes/conjonctivite","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'conjonctivite';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Cystite »","url":"https://www.ameli.fr/assure/sante/themes/cystite","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'cystite';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Prévention et dépistages »","url":"https://www.ameli.fr/assure/sante/assurance-maladie/prevention-depistages","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'depistage';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Trouble dépressif (dépression) »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/depression","publisher":"OMS","year":"2025"}]', "updatedAt" = now() WHERE slug = 'depression';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Diabète »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/diabetes","publisher":"OMS","year":"2024"}]', "updatedAt" = now() WHERE slug = 'diabete-type-2';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Dyspnée chronique ou essoufflement durable »","url":"https://www.ameli.fr/assure/sante/themes/dyspnee-chronique-ou-essoufflement-durable","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'dyspnee';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule une échographie ? »","url":"https://www.ameli.fr/assure/sante/examen/imagerie-medicale/deroulement-echographie-abdomino-pelvienne","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'echographie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Eczéma ou dermatite atopique »","url":"https://www.ameli.fr/assure/sante/themes/eczema-dermatite-atopique","publisher":"ameli.fr"},{"label":"Inserm — dossier « Dermatite atopique »","url":"https://www.inserm.fr/dossier/dermatite-atopique-eczema-atopique/","publisher":"Inserm"}]', "updatedAt" = now() WHERE slug = 'eczema';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Le médicament : ce qu''il faut savoir »","url":"https://www.ameli.fr/assure/sante/medicaments/comprendre-les-differents-medicaments/medicament","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'effet-secondaire';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Électrocardiogramme d''effort : déroulement »","url":"https://www.ameli.fr/assure/sante/examen/exploration/deroulement-electrocardiogramme-effort","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'electrocardiogramme';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule une endoscopie digestive haute ? »","url":"https://www.ameli.fr/assure/sante/examen/exploration/deroulement-endoscopie-digestive-haute","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'endoscopie';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Épilepsie »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/epilepsy","publisher":"OMS"},{"label":"Inserm — dossier « Épilepsie »","url":"https://www.inserm.fr/dossier/epilepsie/","publisher":"Inserm"}]', "updatedAt" = now() WHERE slug = 'epilepsie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule un électrocardiogramme d''effort ? »","url":"https://www.ameli.fr/assure/sante/examen/exploration/deroulement-electrocardiogramme-effort","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'epreuve-d-effort';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Fièvre chez les adultes »","url":"https://www.msdmanuals.com/fr/accueil/infections/biologie-des-maladies-infectieuses/fi%C3%A8vre-chez-les-adultes","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'fievre';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Stéatose hépatique »","url":"https://www.ameli.fr/assure/sante/themes/steatose-hepatique","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'foie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule un frottis du col utérin ? »","url":"https://www.ameli.fr/assure/sante/examen/gynecologie/deroulement-frottis-col-uterin","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'frottis';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Maladies diarrhéiques »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/diarrhoeal-disease","publisher":"OMS"},{"label":"Assurance Maladie — « Gastro-entérite de l''adulte »","url":"https://www.ameli.fr/assure/sante/themes/gastro-enterite-adulte","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'gastro-enterite';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Cécité et déficience visuelle »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/blindness-and-visual-impairment","publisher":"OMS"},{"label":"Assurance Maladie — « Glaucome »","url":"https://www.ameli.fr/assure/sante/themes/glaucome","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'glaucome';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Lire les résultats d''une prise de sang »","url":"https://www.ameli.fr/assure/sante/examen/analyse/lire-resultats-prise-sang","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'glycemie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Goutte »","url":"https://www.ameli.fr/assure/sante/themes/goutte","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'goutte';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Grippe saisonnière »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/influenza-(seasonal)","publisher":"OMS","year":"2025"}]', "updatedAt" = now() WHERE slug = 'grippe';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Hépatite B »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/hepatitis-b","publisher":"OMS","year":"2026"}]', "updatedAt" = now() WHERE slug = 'hepatite-b';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Lombalgie »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/low-back-pain","publisher":"OMS"},{"label":"Assurance Maladie — « Lombalgie aiguë »","url":"https://www.ameli.fr/assure/sante/themes/lombalgie-aigue","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'hernie-discale';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Hypertension artérielle »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/hypertension","publisher":"OMS","year":"2025"}]', "updatedAt" = now() WHERE slug = 'hypertension-arterielle';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Hypoglycémie »","url":"https://www.msdmanuals.com/fr/accueil/troubles-hormonaux-et-m%C3%A9taboliques/diab%C3%A8te-sucr%C3%A9-et-faible-taux-de-sucre-dans-le-sang-hypoglyc%C3%A9mie/hypoglyc%C3%A9mie","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'hypoglycemie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Hypothyroïdie »","url":"https://www.ameli.fr/assure/sante/themes/hypothyroidie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'hypothyroidie';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Jaunisse chez l''adulte »","url":"https://www.msdmanuals.com/fr/accueil/troubles-du-foie-et-de-la-v%C3%A9sicule-biliaire/manifestations-cliniques-des-maladies-du-foie/jaunisse-chez-l-adulte","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'ictere';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Obésité et surpoids »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/obesity-and-overweight","publisher":"OMS"}]', "updatedAt" = now() WHERE slug = 'imc';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Maladies cardiovasculaires »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)","publisher":"OMS"},{"label":"Assurance Maladie — « Infarctus du myocarde »","url":"https://www.ameli.fr/assure/sante/themes/infarctus-myocarde","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'infarctus-du-myocarde';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Maladies cardiovasculaires »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/cardiovascular-diseases-(cvds)","publisher":"OMS"},{"label":"Assurance Maladie — « Insuffisance cardiaque »","url":"https://www.ameli.fr/assure/sante/themes/insuffisance-cardiaque","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'insuffisance-cardiaque';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Traitement médicamenteux du diabète »","url":"https://www.msdmanuals.com/fr/accueil/troubles-hormonaux-et-m%C3%A9taboliques/diab%C3%A8te-sucr%C3%A9-et-faible-taux-de-sucre-dans-le-sang-hypoglyc%C3%A9mie/traitement-m%C3%A9dicamenteux-du-diab%C3%A8te","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'insuline';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule une IRM ? »","url":"https://www.ameli.fr/assure/sante/examen/imagerie-medicale/deroulement-irm","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'irm';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Kinésithérapie du thorax »","url":"https://www.msdmanuals.com/fr/accueil/troubles-pulmonaires-et-des-voies-a%C3%A9riennes/r%C3%A9%C3%A9ducation-pour-les-troubles-des-poumons-et-des-voies-respiratoires/kin%C3%A9sith%C3%A9rapie-du-thorax","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'kinesitherapie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule une mammographie ? »","url":"https://www.ameli.fr/assure/sante/examen/imagerie-medicale/deroulement-mammographie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'mammographie';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Céphalées »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/headache-disorders","publisher":"OMS"},{"label":"Assurance Maladie — « Migraine »","url":"https://www.ameli.fr/assure/sante/themes/migraine","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'migraine';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Obésité et surpoids »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/obesity-and-overweight","publisher":"OMS","year":"2025"}]', "updatedAt" = now() WHERE slug = 'obesite';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Jambes gonflées »","url":"https://www.ameli.fr/assure/sante/themes/jambes-lourdes","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'oedeme';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Lire une ordonnance de médicaments »","url":"https://www.ameli.fr/assure/sante/medicaments/utiliser-recycler-medicaments/lire-ordonnance-medicaments","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'ordonnance';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Ostéoporose »","url":"https://www.ameli.fr/assure/sante/themes/osteoporose","publisher":"ameli.fr"},{"label":"Inserm — dossier « Ostéoporose »","url":"https://www.inserm.fr/dossier/osteoporose/","publisher":"Inserm"}]', "updatedAt" = now() WHERE slug = 'osteoporose';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Palpitations cardiaques »","url":"https://www.ameli.fr/assure/sante/themes/palpitations-cardiaques","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'palpitations';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Pneumonie »","url":"https://www.ameli.fr/assure/sante/themes/pneumonie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'pneumonie';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Présentation du système respiratoire »","url":"https://www.msdmanuals.com/fr/accueil/troubles-pulmonaires-et-des-voies-a%C3%A9riennes/biologie-des-poumons-et-des-voies-respiratoires/pr%C3%A9sentation-du-syst%C3%A8me-respiratoire","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'poumons';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Lire les résultats d''une prise de sang »","url":"https://www.ameli.fr/assure/sante/examen/analyse/lire-resultats-prise-sang","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'prise-de-sang';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Adénome de la prostate »","url":"https://www.ameli.fr/assure/sante/themes/adenome-prostate","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'prostate';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Psoriasis »","url":"https://www.ameli.fr/assure/sante/themes/psoriasis","publisher":"ameli.fr"},{"label":"Inserm — dossier « Psoriasis »","url":"https://www.inserm.fr/dossier/psoriasis/","publisher":"Inserm"}]', "updatedAt" = now() WHERE slug = 'psoriasis';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Radiographies »","url":"https://www.msdmanuals.com/fr/accueil/sujets-particuliers/examens-d-imagerie-courants/radiographies","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'radiographie';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Radiothérapie pour le cancer »","url":"https://www.msdmanuals.com/fr/accueil/cancer/pr%C3%A9vention-et-traitement-du-cancer/radioth%C3%A9rapie-pour-le-cancer","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'radiotherapie';
UPDATE glossary_terms SET sources = '[{"label":"Manuel MSD, version grand public — « Reflux gastro-œsophagien (RGO) »","url":"https://www.msdmanuals.com/fr/accueil/troubles-digestifs/maladies-de-l-%C5%93sophage-et-de-la-d%C3%A9glutition/reflux-gastro-%C5%93sophagien-rgo","publisher":"Manuel MSD"}]', "updatedAt" = now() WHERE slug = 'reflux-gastro-oesophagien';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Maladie rénale chronique »","url":"https://www.ameli.fr/assure/sante/themes/maladie-renale-chronique","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'rein';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Comment se déroule un scanner ? »","url":"https://www.ameli.fr/assure/sante/examen/imagerie-medicale/deroulement-scanner","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'scanner';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Sciatique »","url":"https://www.ameli.fr/assure/sante/themes/sciatique","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'sciatique';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Trouble du rythme cardiaque »","url":"https://www.ameli.fr/assure/sante/themes/trouble-rythme-cardiaque","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'tachycardie';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « La télémédecine »","url":"https://www.ameli.fr/assure/remboursements/rembourse/consultations-telemedecine/telemedecine","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'teleconsultation';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Troubles de la thyroïde »","url":"https://www.ameli.fr/assure/sante/themes/hypothyroidie","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'thyroide';
UPDATE glossary_terms SET sources = '[{"label":"Organisation mondiale de la Santé — « Tuberculose »","url":"https://www.who.int/fr/news-room/fact-sheets/detail/tuberculosis","publisher":"OMS","year":"2026"}]', "updatedAt" = now() WHERE slug = 'tuberculose';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Vaccination »","url":"https://www.ameli.fr/assure/sante/themes/vaccination","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'vaccin';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Varices des jambes »","url":"https://www.ameli.fr/assure/sante/themes/varices-jambes","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'varices';
UPDATE glossary_terms SET sources = '[{"label":"Assurance Maladie — « Vertiges »","url":"https://www.ameli.fr/assure/sante/themes/vertiges","publisher":"ameli.fr"}]', "updatedAt" = now() WHERE slug = 'vertige';

-- ─── 4. Contrôles avant COMMIT ───
DO $$
DECLARE n_posts int; n_ar int; n_signes int; n_glo int;
BEGIN
  SELECT count(*) INTO n_posts FROM posts WHERE slug IN ('mal-de-dents-rage-de-dents-maroc', 'abces-dentaire-maroc', 'dent-de-sagesse-extraction-maroc', 'parodontite-dechaussement-dents-maroc', 'carie-dentaire-maroc', 'chute-de-cheveux-maroc', 'acne-maroc');
  SELECT count(*) INTO n_ar FROM posts WHERE slug IN ('mal-de-dents-rage-de-dents-maroc', 'abces-dentaire-maroc', 'dent-de-sagesse-extraction-maroc', 'parodontite-dechaussement-dents-maroc', 'carie-dentaire-maroc', 'chute-de-cheveux-maroc', 'acne-maroc')
    AND "contentAr" IS NOT NULL AND "arReviewedAt" IS NOT NULL;
  SELECT count(*) INTO n_signes FROM posts p JOIN users u ON u.id = p."reviewedById"
    WHERE p.slug IN ('mal-de-dents-rage-de-dents-maroc', 'abces-dentaire-maroc', 'dent-de-sagesse-extraction-maroc', 'parodontite-dechaussement-dents-maroc', 'carie-dentaire-maroc', 'chute-de-cheveux-maroc', 'acne-maroc') AND u.email = 'redaction@santeaumaroc.com';
  SELECT count(*) INTO n_glo FROM glossary_terms WHERE sources IS NOT NULL;
  IF n_posts <> 7 THEN RAISE EXCEPTION 'Attendu 7 articles, trouvé %', n_posts; END IF;
  IF n_ar <> 7 THEN RAISE EXCEPTION 'Arabe absent ou non relu sur % article(s)', 7 - n_ar; END IF;
  IF n_signes <> 7 THEN RAISE EXCEPTION 'Signature de relecture incorrecte sur % article(s)', 7 - n_signes; END IF;
  IF n_glo < 79 THEN RAISE EXCEPTION 'Sources glossaire : attendu au moins 79, trouvé %', n_glo; END IF;
  RAISE NOTICE 'OK : % articles (arabe relu et signé), % termes de glossaire sourcés', n_posts, n_glo;
END $$;

COMMIT;

-- APRÈS LA MEP : purger le cache ISR des pages touchées, ou attendre la
-- revalidation (revalidate = 3600 sur /blog/[slug] et /glossaire/[slug]).
