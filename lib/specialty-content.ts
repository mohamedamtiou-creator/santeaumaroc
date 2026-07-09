import type { Locale } from "./i18n";

/** Fait chiffré affiché dans l'encadré « L'essentiel » (1 tuile = 1 valeur + libellé). */
export type EssentielFact = { value: string; label: string };
/** Bloc éditorial additionnel rendu en H2 + paragraphes. */
export type EditorialSection = { h: string; body: string[] };
/** Tableau de tarifs indicatifs (idéal featured snippets / AI Overview). */
export type PriceTable = {
  title: string;
  intro?: string;
  rows: { label: string; value: string }[];
  note?: string;
};

export type SpecialtyContent = {
  synonyme: string;
  /** Pluriel explicite quand la règle automatique échoue (noms composés à trait
   *  d'union « chirurgien-dentiste » → « chirurgiens-dentistes », ou « médical »
   *  → « médicaux »). Sinon `pluralizeSynonyme(synonyme)` est utilisé. */
  synonymePluriel?: string;
  description: string;
  quandConsulter: string[];
  faqs: { q: string; a: string }[];
  /* ── Enrichissements P1 (optionnels, rendus seulement si présents) ── */
  essentiel?: EssentielFact[];
  sections?: EditorialSection[];
  prix?: PriceTable;
  /** Date ISO de dernière relecture éditoriale SPÉCIFIQUE à cette spécialité
   *  (E-E-A-T + fraîcheur). Prime sur la constante globale `CONTENT_REVIEWED`
   *  quand elle est présente — sert `lastReviewed`/`dateModified` (JSON-LD) et
   *  l'encadré « L'essentiel ». Ne la renseigner qu'après une vraie relecture. */
  reviewed?: string;
};

/** Contenu arabe : description, motifs de consultation et FAQ (le `synonyme`
 *  reste géré côté FR — l'arabe titre via le nom de spécialité traduit). */
type SpecialtyContentAr = Omit<SpecialtyContent, "synonyme">;

const SPECIALTY_CONTENT: Record<string, SpecialtyContent> = {
  "acupuncture": {
    synonyme: "acupuncteur",
    reviewed: "2026-07-05",
    description:
      "L'acupuncture est une pratique de médecine complémentaire, issue de la médecine traditionnelle chinoise, qui consiste à stimuler des points précis du corps à l'aide de fines aiguilles stériles à usage unique. Au Maroc, elle est le plus souvent pratiquée par des médecins formés à cette technique et vient en complément — jamais en remplacement — d'une prise en charge médicale conventionnelle. Elle est surtout étudiée pour le soulagement de certaines douleurs chroniques (lombalgie, cervicalgie, arthrose du genou), des migraines et céphalées de tension, des nausées et de troubles fonctionnels liés au stress. L'acupuncteur commence toujours par un interrogatoire et un examen afin d'écarter une cause nécessitant un traitement médical spécifique avant de proposer un plan de séances. Les données scientifiques indiquent un bénéfice pour plusieurs de ces indications, mais l'acupuncture ne se substitue pas à un diagnostic médical ni à un traitement prescrit.",
    quandConsulter: [
      "Douleurs chroniques : lombalgie, cervicalgie, arthrose",
      "Migraines et céphalées de tension récurrentes",
      "Stress, anxiété ou troubles du sommeil",
      "Nausées liées à la grossesse, à une opération ou à une chimiothérapie",
      "Accompagnement d'un sevrage tabagique",
    ],
    faqs: [
      {
        q: "L'acupuncture est-elle efficace ?",
        a: "Les données scientifiques montrent un bénéfice pour plusieurs indications, en particulier certaines douleurs chroniques (lombalgie, cervicalgie, arthrose du genou), les migraines et les nausées. L'effet varie d'une personne et d'une indication à l'autre. L'acupuncture est proposée en complément d'un suivi médical et ne remplace ni un diagnostic ni un traitement prescrit.",
      },
      {
        q: "Une séance d'acupuncture est-elle douloureuse ?",
        a: "Les aiguilles utilisées sont très fines, bien plus qu'une aiguille d'injection. La pose est généralement indolore ; certains patients ressentent un léger picotement, une sensation de lourdeur ou de chaleur au point de puncture, qui reste passagère et bénigne.",
      },
      {
        q: "Combien de séances d'acupuncture faut-il prévoir ?",
        a: "Cela dépend du motif et de votre réponse au traitement. Pour une douleur chronique, plusieurs séances (souvent 4 à 6) réparties sur quelques semaines sont fréquemment nécessaires, avec une réévaluation régulière. L'acupuncteur adapte le nombre et le rythme des séances à votre situation.",
      },
      {
        q: "Combien coûte une séance d'acupuncture au Maroc ?",
        a: "Le prix d'une séance varie généralement entre 200 et 500 MAD selon la ville et le praticien, la première consultation (bilan) pouvant être un peu plus élevée. Les honoraires sont libres au Maroc ; le remboursement par la CNSS, l'AMO ou une mutuelle dépend de votre contrat et n'est pas systématique.",
      },
      {
        q: "L'acupuncture présente-t-elle des risques ou des contre-indications ?",
        a: "Pratiquée par un professionnel formé avec des aiguilles stériles à usage unique, l'acupuncture est généralement bien tolérée. Les effets indésirables sont rares et bénins (léger saignement, petit hématome, fatigue passagère). Signalez toujours une grossesse, un traitement anticoagulant ou un trouble de la coagulation, un déficit immunitaire, ou le port d'un stimulateur cardiaque (en cas d'électro-acupuncture). En cas de douleur thoracique, de malaise ou de tout signe d'urgence, consultez un médecin ou les urgences, pas un acupuncteur.",
      },
      {
        q: "Comment prendre rendez-vous avec un acupuncteur au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Acupuncture » et sélectionnez votre ville. Consultez les profils, les avis patients et les disponibilités, puis réservez en ligne gratuitement, sans frais d'inscription.",
      },
      { q: "L'acupuncture est-elle prise en charge par la CNSS ou l'AMO au Maroc ?", a: "Dans le cas général, l'acupuncture n'est pas inscrite au panier de soins remboursables de l'AMO gérée par la CNSS, et n'entre donc pas dans la nomenclature tarifaire de référence (TNR/ANAM). Les séances restent le plus souvent à votre charge. Certaines assurances complémentaires ou mutuelles privées peuvent proposer un forfait « médecines douces » : renseignez-vous auprès de votre organisme et demandez une facture détaillée à l'acupuncteur." },
      { q: "Peut-on faire de l'acupuncture pendant la grossesse au Maroc ?", a: "L'acupuncture peut être envisagée pendant la grossesse pour certains inconforts (nausées, douleurs lombaires), mais uniquement avec un praticien informé de votre état, car plusieurs points sont contre-indiqués et peuvent stimuler l'utérus. Signalez systématiquement votre grossesse dès la prise de rendez-vous. Elle ne remplace jamais le suivi obstétrical de votre gynécologue ou sage-femme." },
      { q: "Comment vérifier le sérieux d'un acupuncteur au Maroc ?", a: "Vérifiez la formation du praticien et, s'il est médecin ou professionnel de santé, son inscription à l'ordre correspondant. Assurez-vous qu'il utilise exclusivement des aiguilles stériles à usage unique, sorties devant vous de leur emballage scellé. Un praticien sérieux vous interroge sur vos antécédents et vos traitements, et vous oriente vers un médecin si vos symptômes le justifient. Sur SantéauMaroc, consultez le profil et les avis avant de réserver." },
    ],
    essentiel: [
      { value: "200 – 500 MAD", label: "Prix indicatif d'une séance" },
      { value: "Plusieurs séances", label: "Souvent nécessaires" },
      { value: "En complément", label: "Ne remplace pas un traitement" },
    ],
    sections: [
      {
        h: "Comment se déroule une séance d'acupuncture ?",
        body: [
          "La première séance débute par un interrogatoire détaillé (motif, antécédents, traitements en cours, mode de vie) et un examen clinique. Cette étape permet à l'acupuncteur de comprendre votre situation et de vérifier qu'aucun signe ne nécessite d'abord une prise en charge médicale spécifique.",
          "Vous êtes ensuite installé allongé, confortablement. Le praticien insère de fines aiguilles stériles à usage unique sur des points précis, qu'il laisse en place environ 20 à 30 minutes. La sensation ressentie est généralement légère : picotement, lourdeur ou chaleur. Une séance dure le plus souvent entre 30 et 45 minutes.",
        ],
      },
      {
        h: "Que peut soulager l'acupuncture ? Indications et données scientifiques",
        body: [
          "L'acupuncture est surtout étudiée dans la prise en charge de certaines douleurs chroniques — lombalgie, cervicalgie, arthrose du genou —, des migraines et céphalées de tension, des nausées (grossesse, suites d'opération, chimiothérapie) et des manifestations liées au stress, à l'anxiété ou aux troubles du sommeil. Elle est aussi parfois proposée en accompagnement d'un sevrage tabagique.",
          "Les données scientifiques indiquent un bénéfice réel pour plusieurs de ces indications, mais l'effet reste variable selon les personnes. L'acupuncture agit comme un complément : elle ne traite pas la cause d'une maladie et ne remplace ni un diagnostic médical, ni un traitement prescrit. Pour tout symptôme persistant, nouveau ou inquiétant, une évaluation médicale reste indispensable.",
        ],
      },
      {
        h: "Sécurité, précautions et contre-indications",
        body: [
          "L'acupuncture est considérée comme sûre lorsqu'elle est réalisée par un praticien formé, avec des aiguilles stériles à usage unique. Les effets indésirables sont rares et le plus souvent bénins : léger saignement ou petit hématome au point de puncture, fatigue ou sensation de détente passagère après la séance.",
          "Certaines situations imposent une vigilance particulière : grossesse, traitement anticoagulant ou trouble de la coagulation, déficit immunitaire, infection ou lésion cutanée, port d'un stimulateur cardiaque en cas d'électro-acupuncture. Signalez-les systématiquement à votre acupuncteur. Enfin, l'acupuncture n'est jamais adaptée à une urgence : devant une douleur thoracique, un essoufflement soudain, un malaise ou un saignement abondant, contactez un médecin ou les urgences (15 / 141).",
        ],
      },
      {
        h: "Avant et après une séance : conseils pratiques",
        body: [
          "Avant la séance, évitez de venir à jeun : prenez un repas léger et restez bien hydraté. Munissez-vous de vos examens et ordonnances récents, et informez le praticien de vos traitements en cours, d'une éventuelle grossesse ou de tout problème de santé particulier.",
          "Après la séance, une sensation de fatigue ou de relâchement est fréquente et passagère : buvez de l'eau et accordez-vous un moment de repos si possible. Les effets peuvent se manifester progressivement sur les jours qui suivent. En cas de réaction inhabituelle ou persistante, parlez-en à votre acupuncteur ou à votre médecin traitant.",
        ],
      },
      {
        h: "Acupuncture et médecine conventionnelle : une approche complémentaire",
        body: [
          "L'acupuncture s'inscrit dans une démarche complémentaire : elle peut améliorer le confort et soulager certains symptômes, en parallèle d'un suivi médical, et non à sa place. Elle ne dispense jamais d'un diagnostic posé par un médecin.",
          "Informez votre médecin traitant des séances que vous envisagez, en particulier si vous suivez un traitement pour une maladie chronique. N'interrompez jamais un traitement prescrit sans avis médical. Cette coordination garantit une prise en charge cohérente et sécurisée.",
        ],
      },
      {
        h: "Acupuncteur médecin ou non-médecin : ce que dit le cadre marocain",
        body: [
          "Au Maroc, l'acupuncture est pratiquée aussi bien par des médecins ayant suivi une formation complémentaire que par des praticiens non-médecins. Cette distinction est importante : seul un médecin peut poser un diagnostic médical, prescrire des examens ou des médicaments, et interpréter un bilan. Un acupuncteur non-médecin propose une prise en charge fondée sur l'approche de la médecine traditionnelle chinoise et ne se substitue en aucun cas à un avis médical.",
          "Quel que soit son statut, un acupuncteur sérieux reste dans son champ de compétence et vous oriente vers un médecin devant tout symptôme d'alerte : douleur thoracique, fièvre persistante, perte de poids inexpliquée, trouble neurologique. En cas d'urgence vitale, appelez immédiatement le 15 (SAMU) sans attendre une séance. L'acupuncture s'inscrit en complément d'un suivi médical, jamais comme un traitement de remplacement d'une pathologie diagnostiquée.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une séance d'acupuncture au Maroc ?",
      intro:
        "Les honoraires sont libres au Maroc et varient selon la ville, l'expérience du praticien et le type de séance. Voici des fourchettes indicatives constatées.",
      rows: [
        { label: "Séance de suivi (grandes villes)", value: "300 – 500 MAD" },
        { label: "Séance de suivi (villes moyennes)", value: "200 – 400 MAD" },
        { label: "Première consultation avec bilan", value: "300 – 600 MAD" },
        { label: "Forfait de plusieurs séances", value: "Souvent proposé, sur devis" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Le remboursement par la CNSS, l'AMO ou une mutuelle dépend de votre contrat et n'est pas systématique pour l'acupuncture.",
    },
  },

  "nephrologie": {
    synonyme: "néphrologue",
    synonymePluriel: "néphrologues",
    reviewed: "2026-07-05",
    description:
      "Le néphrologue est le médecin spécialiste des reins. Au Maroc, il prend en charge l'insuffisance rénale aiguë et chronique, l'hypertension d'origine rénale, la protéinurie, les calculs, les infections rénales et le suivi rénal du diabète, maladie très fréquente dans le pays. Il ne faut pas le confondre avec l'urologue, qui est le chirurgien des voies urinaires. Le néphrologue coordonne aussi la dialyse et prépare, avec l'équipe de transplantation, les patients en insuffisance rénale terminale. On le consulte dans le secteur public (CHU, hôpitaux régionaux, centres d'hémodialyse) comme dans le privé (cabinets et cliniques des grandes villes). Les honoraires sont libres dans le privé et varient selon la ville et la réputation du praticien. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation et des examens, selon la tarification nationale de référence (TNR). SantéauMaroc vous aide à trouver un néphrologue de confiance près de chez vous et à prendre rendez-vous en ligne gratuitement.",
    quandConsulter: [
      "Vous êtes diabétique ou hypertendu et votre médecin a détecté une baisse de la fonction rénale ou une protéinurie.",
      "Une analyse de sang montre une créatinine élevée ou un débit de filtration glomérulaire (DFG) diminué.",
      "Vous avez du sang ou une mousse persistante dans les urines, ou des gonflements des jambes et du visage (œdèmes).",
      "Vous souffrez de calculs rénaux à répétition ou d'infections urinaires hautes récidivantes.",
      "Vous êtes en insuffisance rénale et devez organiser la surveillance, la dialyse ou un projet de greffe.",
    ],
    faqs: [
      { q: "Quelle est la différence entre un néphrologue et un urologue au Maroc ?", a: "Le néphrologue est un médecin qui traite les maladies du rein par des moyens médicaux : insuffisance rénale, hypertension rénale, protéinurie, dialyse. L'urologue est un chirurgien des voies urinaires (prostate, vessie, calculs à opérer). Les deux peuvent collaborer, par exemple pour un patient souffrant de calculs rénaux." },
      { q: "Combien coûte une consultation chez un néphrologue au Maroc ?", a: "Dans le privé, les honoraires sont libres. Comptez en moyenne 300 à 500 MAD dans les grandes villes (Casablanca, Rabat, Marrakech) et 250 à 400 MAD ailleurs. Dans le secteur public (CHU, hôpitaux), le tarif est plus faible. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel." },
      { q: "Comment prendre rendez-vous avec un néphrologue au Maroc ?", a: "Sur SantéauMaroc, filtrez par spécialité « Néphrologie » et par ville pour afficher les praticiens proches de chez vous. Vous consultez leurs coordonnées, langues et disponibilités, puis réservez en ligne gratuitement. Une lettre d'orientation de votre médecin traitant est souvent utile pour la première consultation." },
      { q: "La dialyse est-elle prise en charge au Maroc ?", a: "L'hémodialyse chronique est prise en charge pour les assurés CNSS et AMO ainsi que par le régime destiné aux personnes démunies, selon les modalités en vigueur. Elle se pratique dans des centres publics et privés conventionnés. Votre néphrologue vous oriente vers le centre le plus adapté à votre situation." },
      { q: "Le diabète peut-il abîmer les reins ?", a: "Oui, le diabète est l'une des principales causes d'insuffisance rénale au Maroc. Il peut entraîner une néphropathie diabétique, souvent silencieuse au début. Un suivi néphrologique, avec dosage régulier de la créatinine et recherche de protéinurie, permet de dépister et de ralentir l'atteinte rénale." },
      { q: "Quels examens le néphrologue peut-il demander ?", a: "Il s'appuie sur des analyses de sang (créatinine, DFG, ionogramme), des analyses d'urine (protéinurie, sédiment), une échographie des reins et, dans certains cas, une biopsie rénale. Ces examens précisent la cause et le stade de la maladie afin d'adapter le traitement." },
      { q: "Les anti-inflammatoires vendus en pharmacie peuvent-ils abîmer les reins ?", a: "Oui, la prise répétée d'anti-inflammatoires (AINS comme l'ibuprofène ou le diclofénac), très courante en automédication au Maroc, peut altérer la fonction rénale, surtout chez les personnes âgées, diabétiques, hypertendues ou déshydratées. Certains produits traditionnels et certaines cures d'herbes peuvent aussi être toxiques pour les reins. Signalez toujours au néphrologue tout médicament ou remède que vous prenez, même sans ordonnance." },
      { q: "L'hypertension artérielle est-elle une cause de maladie rénale au Maroc ?", a: "Oui, l'hypertension mal contrôlée est, avec le diabète, l'une des principales causes d'insuffisance rénale au Maroc. Le rein est à la fois victime et acteur de l'hypertension, ce qui crée un cercle aggravant. Un bon contrôle de la tension, un suivi régulier et un traitement adapté prescrit par le médecin permettent de protéger durablement la fonction rénale." },
      { q: "Peut-on jeûner pendant le Ramadan quand on a une maladie rénale ?", a: "Cela dépend du stade de la maladie et du traitement : certains patients rénaux stables peuvent jeûner, d'autres (dialysés, greffés, insuffisance avancée, calculs récidivants) risquent la déshydratation ou des déséquilibres. La décision doit être prise avec le néphrologue avant le Ramadan, jamais seul. L'islam dispense du jeûne en cas de risque pour la santé, et le médecin peut adapter les horaires de prise des médicaments." },
    ],
    essentiel: [
      { value: "300 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Reins & dialyse", label: "Médecin des reins, pas chirurgien" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les maladies prises en charge par le néphrologue",
        body: [
          "Le néphrologue traite l'ensemble des maladies rénales médicales : insuffisance rénale aiguë et chronique, glomérulonéphrites, néphropathie diabétique et hypertensive, protéinurie, hématurie, troubles de l'équilibre du potassium et du sodium. Il prend aussi en charge l'hypertension artérielle d'origine rénale, difficile à contrôler, et le retentissement rénal des maladies générales.",
          "Au Maroc, le diabète et l'hypertension, très fréquents, sont les premières causes d'atteinte rénale. Le néphrologue intervient souvent en relais du médecin généraliste ou du diabétologue, lorsque les analyses montrent une dégradation de la fonction rénale, pour ralentir l'évolution et prévenir le passage au stade de dialyse.",
        ],
      },
      {
        h: "Les examens et actes en néphrologie",
        body: [
          "Le bilan rénal repose d'abord sur des analyses simples : dosage de la créatinine avec estimation du débit de filtration glomérulaire (DFG), ionogramme, recherche de protéines et de sang dans les urines. L'échographie rénale évalue la taille et la morphologie des reins. Ces examens, largement disponibles au Maroc, guident le diagnostic.",
          "Dans certaines situations, le néphrologue réalise ou prescrit une biopsie rénale pour identifier précisément la maladie, ou organise la prise en charge en dialyse. Il assure aussi le bilan pré-greffe et le suivi des patients transplantés, en lien avec les centres de transplantation universitaires.",
        ],
      },
      {
        h: "Dépistage et prévention de la maladie rénale",
        body: [
          "La maladie rénale chronique évolue longtemps sans symptôme. Le dépistage est essentiel chez les personnes à risque : diabétiques, hypertendus, personnes âgées, patients ayant des antécédents familiaux de maladie rénale. Un simple dosage de la créatinine et une recherche de protéinurie permettent un repérage précoce.",
          "La prévention passe par un bon contrôle de la tension et du sucre, une hydratation suffisante, la limitation du sel et la prudence avec les médicaments toxiques pour le rein, notamment l'usage répété d'anti-inflammatoires. Le néphrologue accompagne ces mesures d'hygiène de vie et adapte les traitements pour protéger les reins.",
        ],
      },
      {
        h: "Parcours de soins et remboursement au Maroc",
        body: [
          "Le parcours débute souvent chez le médecin généraliste, qui oriente vers le néphrologue en cas d'anomalie du bilan rénal. La consultation peut avoir lieu dans le secteur public (CHU, hôpitaux régionaux) ou dans le privé. Une lettre d'orientation facilite la prise en charge et le suivi coordonné.",
          "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation et des examens, sur la base de la tarification nationale de référence, généralement autour de 80 % du TNR pour une consultation de base. L'hémodialyse chronique fait l'objet d'une prise en charge spécifique dans les centres conventionnés.",
        ],
      },
      {
        h: "Insuffisance rénale terminale : dialyse et greffe",
        body: [
          "Lorsque les reins ne fonctionnent plus suffisamment, le néphrologue propose une méthode de suppléance : l'hémodialyse, réalisée plusieurs fois par semaine en centre, la dialyse péritonéale, réalisable à domicile, ou la transplantation rénale, meilleure solution à long terme lorsqu'elle est possible.",
          "Le choix dépend de l'état du patient, de son mode de vie et de la disponibilité d'un greffon. Le néphrologue prépare le dossier, informe le patient et sa famille et assure le suivi au long cours. En cas d'urgence (fièvre, douleur intense, malaise, arrêt des urines), il faut consulter sans délai ou appeler le 15 (SAMU).",
        ],
      },
      {
        h: "Reins et vie quotidienne au Maroc : médicaments, jeûne et hydratation",
        body: [
          "La protection des reins passe autant par le suivi médical que par les habitudes du quotidien. Au Maroc, l'automédication est fréquente : anti-inflammatoires pris pour des douleurs, antibiotiques sans ordonnance, mais aussi tisanes et remèdes traditionnels supposés « nettoyer les reins ». Or plusieurs de ces produits peuvent au contraire être néphrotoxiques, en particulier chez les personnes diabétiques, hypertendues, âgées ou déjà atteintes d'une maladie rénale. La règle de prudence est simple : ne prendre aucun médicament ou remède au long cours sans en parler au médecin, et présenter au néphrologue la liste complète de ce que l'on consomme, ordonnance ou pas.",
          "Le climat chaud d'une grande partie du pays et le jeûne du Ramadan posent aussi la question de l'hydratation. Une déshydratation répétée sollicite les reins et favorise les calculs. Pour la population générale, boire suffisamment d'eau au fil de la journée reste un bon réflexe, sans excès inutile. En revanche, les patients rénaux ne doivent pas décider seuls de leur consommation de liquides : selon le stade de la maladie et le traitement, le néphrologue peut au contraire recommander de limiter les apports. Toute décision de jeûner doit être validée avec lui en amont ; en cas de malaise, de forte fièvre ou de signes de déshydratation sévère, il faut consulter sans tarder et, en urgence vitale, appeler le 15 (SAMU).",
        ],
      },
    ],
    prix: {
      title: "Prix et tarifs en néphrologie au Maroc",
      intro: "Dans le privé, les honoraires sont libres et varient selon la ville, le praticien et la complexité du dossier. Voici des fourchettes indicatives pour 2026. Le secteur public applique des tarifs plus faibles.",
      rows: [
        { label: "Consultation de néphrologie (grandes villes)", value: "300 – 500 MAD" },
        { label: "Consultation de néphrologie (autres villes)", value: "250 – 400 MAD" },
        { label: "Échographie rénale", value: "300 – 600 MAD" },
        { label: "Bilan sanguin rénal (créatinine, DFG, ionogramme)", value: "150 – 400 MAD" },
        { label: "Séance d'hémodialyse (centre conventionné)", value: "prise en charge CNSS / AMO" },
      ],
      note: "Tarifs indicatifs 2026, hors examens complémentaires. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel selon la tarification nationale de référence (TNR).",
    },
  },

  "kinesitherapie": {
    synonyme: "kinésithérapeute",
    reviewed: "2026-07-05",
    description:
      "La kinésithérapie, aussi appelée physiothérapie, est une profession paramédicale qui occupe une place essentielle dans le parcours de soins au Maroc. Le kinésithérapeute n'est pas médecin : il intervient sur prescription d'un médecin généraliste ou spécialiste pour rééduquer le corps après une blessure, une chirurgie ou une maladie. Son champ d'action est large : rééducation après fracture, entorse ou pose de prothèse, traitement du mal de dos et des douleurs articulaires, rééducation respiratoire, neurologique (après AVC par exemple) et prise en charge du sportif. Le traitement repose sur des séances multiples, souvent plusieurs par semaine sur plusieurs semaines, combinant exercices, mobilisations manuelles, massages et appareils. Au Maroc, on trouve des kinésithérapeutes en cabinet libéral, en clinique privée et dans les hôpitaux publics. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des séances lorsqu'elles sont prescrites. Sur SantéauMaroc, vous pouvez trouver un kinésithérapeute proche de chez vous et prendre rendez-vous en ligne gratuitement.",
    quandConsulter: [
      "Après une fracture, une entorse ou une opération, pour récupérer mobilité et force",
      "En cas de mal de dos, de cervicalgie ou de sciatique persistante",
      "Pour une rééducation après un AVC ou une atteinte neurologique",
      "En cas de gêne respiratoire chronique nécessitant un désencombrement (kiné respiratoire)",
      "Après une blessure sportive ou pour prévenir les récidives chez le sportif",
    ],
    faqs: [
      { q: "Combien coûte une séance de kinésithérapie au Maroc ?", a: "Dans le privé, les honoraires sont libres. Une séance coûte généralement entre 120 et 300 MAD selon la ville, le cabinet et le type de rééducation. Comme un traitement demande plusieurs séances, il est utile de demander le tarif global dès la première visite." },
      { q: "Faut-il une ordonnance pour voir un kinésithérapeute ?", a: "Oui, au Maroc le kinésithérapeute agit sur prescription médicale. Un médecin généraliste ou spécialiste établit une ordonnance précisant le nombre et le type de séances. Cette prescription est aussi indispensable pour obtenir un remboursement de la CNSS ou de l'AMO." },
      { q: "Les séances de kinésithérapie sont-elles remboursées ?", a: "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des séances lorsqu'elles sont prescrites par un médecin. Le remboursement se fait sur la base du tarif de référence (TNR) ; le reste à charge dépend de la couverture et des honoraires réels du cabinet." },
      { q: "Combien de séances de kinésithérapie sont nécessaires ?", a: "Cela dépend de la pathologie. Une entorse simple peut demander quelques séances, tandis qu'une rééducation après prothèse ou AVC en nécessite souvent plusieurs dizaines. Le kinésithérapeute réévalue régulièrement les progrès et adapte le nombre de séances avec le médecin prescripteur." },
      { q: "Quelle est la différence entre kinésithérapeute et ostéopathe ?", a: "Le kinésithérapeute est un professionnel paramédical qui rééduque sur prescription médicale, avec des séances souvent remboursables. L'ostéopathe pratique des manipulations manuelles et n'exige pas d'ordonnance. Les deux peuvent être complémentaires, mais seul le suivi kiné entre dans le cadre du remboursement CNSS/AMO." },
      { q: "Comment prendre rendez-vous avec un kinésithérapeute au Maroc ?", a: "Sur SantéauMaroc, filtrez par spécialité « Kinésithérapie » et par ville pour trouver un praticien proche de chez vous, puis réservez en ligne gratuitement. Pensez à apporter votre ordonnance et vos éventuels examens (radios, IRM) lors de la première séance." },
      { q: "Un kinésithérapeute peut-il venir faire les séances à domicile ?", a: "Oui, de nombreux kinésithérapeutes proposent des séances à domicile, une solution précieuse pour les personnes âgées, les patients immobilisés après une chirurgie ou ceux qui ne peuvent pas se déplacer. Le tarif est généralement plus élevé qu'en cabinet, souvent entre 200 et 400 MAD, en raison du déplacement. Précisez ce besoin lors de la prise de rendez-vous, car tous les praticiens ne l'assurent pas." },
      { q: "Combien de temps dure une séance de kinésithérapie ?", a: "Une séance dure le plus souvent entre 20 et 45 minutes, selon la pathologie et les techniques employées. La première séance est généralement plus longue car elle inclut un bilan complet de la douleur, de la mobilité et de la force. Le kinésithérapeute adapte ensuite la durée en fonction de la fatigue du patient et des progrès observés." },
      { q: "Le kinésithérapeute peut-il poser un diagnostic médical ?", a: "Non, le kinésithérapeute n'est pas médecin et ne pose pas de diagnostic médical ni ne prescrit d'examens ou de médicaments. Il réalise un bilan fonctionnel (mobilité, force, douleur) pour orienter sa rééducation, mais dans le cadre de l'ordonnance établie par le médecin. Si des signes inhabituels apparaissent, il vous réoriente vers votre médecin traitant ou le spécialiste prescripteur." },
    ],
    essentiel: [
      { value: "120 – 300 MAD", label: "Tarif d'une séance" },
      { value: "Sur prescription", label: "Accès paramédical, agit sur ordonnance" },
      { value: "CNSS · AMO", label: "Remboursement partiel si prescrit" },
    ],
    sections: [
      {
        h: "Les principaux motifs de rééducation",
        body: [
          "Le kinésithérapeute prend en charge un très large éventail de situations. Les plus fréquentes au Maroc sont les suites de traumatismes (fractures, entorses, luxations), les douleurs de la colonne vertébrale (lombalgies, cervicalgies, sciatiques) et la rééducation après une chirurgie orthopédique comme la pose d'une prothèse de hanche ou de genou.",
          "Il intervient aussi en rééducation neurologique, notamment après un accident vasculaire cérébral, pour aider le patient à retrouver mobilité et autonomie. La kinésithérapie respiratoire, utile chez le nourrisson bronchiolitique comme chez l'adulte encombré, et la prise en charge des sportifs complètent ce champ d'action très polyvalent.",
        ],
      },
      {
        h: "Le déroulement d'une séance",
        body: [
          "Une séance commence par un bilan qui évalue la douleur, la mobilité et la force. À partir de ce bilan et de la prescription médicale, le kinésithérapeute établit un plan de traitement personnalisé qui évolue au fil des progrès du patient.",
          "Les techniques utilisées combinent exercices actifs et étirements, mobilisations et manipulations manuelles, massages, et parfois des appareils (électrothérapie, ultrasons, chaleur, froid). La rééducation demande la participation active du patient, y compris par des exercices à poursuivre à domicile entre les séances.",
        ],
      },
      {
        h: "Prévention et éducation du patient",
        body: [
          "Au-delà du soin, le kinésithérapeute a un rôle de prévention. Il apprend au patient les bons gestes du quotidien, corrige les postures au travail et conseille sur l'aménagement du poste ou le port de charges pour éviter les récidives de mal de dos.",
          "Chez le sportif, il propose des programmes de renforcement et d'échauffement pour prévenir les blessures. Cette dimension éducative est essentielle : elle permet au patient de devenir acteur de sa récupération et de préserver durablement ses résultats.",
        ],
      },
      {
        h: "Remboursement et parcours de soins",
        body: [
          "Au Maroc, la kinésithérapie s'inscrit dans un parcours de soins prescrit. Le médecin traitant ou le spécialiste rédige une ordonnance détaillant le nombre et le type de séances, document indispensable pour bénéficier d'une prise en charge.",
          "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des séances prescrites, calculé sur la base du tarif national de référence (TNR). Dans le secteur public et dans certaines cliniques conventionnées, le coût peut être réduit ; il est recommandé de conserver factures et feuilles de soins pour le remboursement.",
        ],
      },
      {
        h: "Cas particuliers : enfants, seniors et sportifs",
        body: [
          "La kinésithérapie s'adapte à chaque âge de la vie. Chez le nourrisson et l'enfant, elle traite notamment les bronchiolites, les troubles orthopédiques et les retards moteurs, avec des techniques douces et ludiques adaptées.",
          "Chez le senior, elle vise à préserver l'autonomie, prévenir les chutes et rééduquer après fracture ou prothèse. Chez le sportif, elle accélère le retour au terrain et limite les récidives. Dans tous les cas, la coordination avec le médecin prescripteur garantit une prise en charge cohérente.",
        ],
      },
      {
        h: "Reconnaître un kinésithérapeute qualifié au Maroc",
        body: [
          "La kinésithérapie est une profession paramédicale réglementée au Maroc. Pour exercer, le praticien doit être titulaire d'un diplôme reconnu (délivré par les instituts publics comme les ISPITS ou par des établissements privés agréés) et disposer d'une autorisation d'exercer. Un professionnel sérieux affiche son diplôme, exerce dans un cabinet identifiable et travaille toujours sur la base d'une prescription médicale, gage d'un cadre de soins conforme.",
          "Il est légitime de se renseigner sur la formation et l'expérience du praticien, en particulier pour une rééducation spécifique (neurologique, respiratoire, pédiatrique ou sportive). Sur SantéauMaroc, chaque profil précise la ville, les langues parlées et les modalités de prise en charge, ce qui vous aide à choisir un kinésithérapeute adapté à votre situation. En cas de doute sur une technique proposée, n'hésitez pas à en parler à votre médecin prescripteur.",
        ],
      },
    ],
    prix: {
      title: "Tarifs de la kinésithérapie au Maroc",
      intro: "Dans le secteur privé, les honoraires des kinésithérapeutes sont libres et varient selon la ville, le cabinet et le type de rééducation. Voici des fourchettes indicatives pour vous situer.",
      rows: [
        { label: "Séance en cabinet (grandes villes)", value: "150 – 300 MAD" },
        { label: "Séance en cabinet (autres villes)", value: "120 – 250 MAD" },
        { label: "Bilan initial / première évaluation", value: "150 – 350 MAD" },
        { label: "Séance de kiné respiratoire (nourrisson)", value: "150 – 300 MAD" },
        { label: "Séance à domicile", value: "200 – 400 MAD" },
      ],
      note: "Fourchettes indicatives 2026, à titre d'information et non contractuelles. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des séances prescrites, sur la base du tarif de référence (TNR).",
    },
  },

  "sage-femme": {
    synonyme: "sage-femme",
    synonymePluriel: "sages-femmes",
    reviewed: "2026-07-05",
    description:
      "La sage-femme est une professionnelle de santé spécialisée dans le suivi de la grossesse physiologique, l'accouchement et la période post-natale. Au Maroc, elle exerce aussi bien dans le secteur public (maisons d'accouchement, centres de santé, maternités hospitalières) que dans le secteur libéral, en cabinet privé ou en clinique. Elle assure la surveillance des grossesses sans risque particulier, la préparation à la naissance, l'accouchement eutocique ainsi que le suivi de la mère et du nouveau-né après la naissance. Son champ d'action couvre aussi la contraception, le frottis de dépistage et l'éducation à la santé sexuelle et reproductive. Dès qu'un facteur de risque apparaît, elle oriente la patiente vers un gynécologue-obstétricien. La profession joue un rôle central dans la réduction de la mortalité maternelle et néonatale au Maroc, notamment à travers les programmes nationaux de santé maternelle. Sur SantéauMaroc, vous pouvez identifier une sage-femme proche de chez vous et organiser un suivi de grossesse serein et de proximité.",
    quandConsulter: [
      "Dès le début d'une grossesse pour débuter un suivi régulier et les examens recommandés",
      "Pour préparer l'accouchement (cours de préparation à la naissance et à la parentalité)",
      "Après l'accouchement, pour le suivi post-natal de la mère et du nouveau-né",
      "Pour une consultation de contraception ou le choix d'une méthode adaptée",
      "Pour un frottis de dépistage ou un conseil en santé sexuelle et reproductive",
    ],
    faqs: [
      { q: "Quelle est la différence entre une sage-femme et un gynécologue ?", a: "La sage-femme suit les grossesses physiologiques, c'est-à-dire sans risque particulier, et pratique les accouchements normaux. Le gynécologue-obstétricien prend en charge les grossesses à risque, les pathologies et les interventions comme la césarienne. La sage-femme oriente vers le gynécologue dès qu'un facteur de risque est détecté." },
      { q: "Combien coûte une consultation chez une sage-femme au Maroc ?", a: "Dans le secteur libéral, les honoraires sont libres. Une consultation coûte généralement entre 200 et 400 MAD dans les grandes villes, et entre 150 et 300 MAD ailleurs. Dans le secteur public et les centres de santé, le suivi de grossesse est très peu coûteux, voire gratuit selon les structures." },
      { q: "Une sage-femme peut-elle réaliser l'accouchement ?", a: "Oui, la sage-femme est habilitée à pratiquer les accouchements normaux (eutociques). Elle surveille le travail, réalise l'accouchement et assure les premiers soins au nouveau-né. En cas de complication, elle fait appel à un gynécologue-obstétricien pour une prise en charge médicale ou chirurgicale." },
      { q: "Le suivi par une sage-femme est-il remboursé au Maroc ?", a: "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des actes de suivi de grossesse et d'accouchement, selon la tarification nationale de référence (TNR). Le montant remboursé varie selon la structure et la nature de l'acte. Il est conseillé de conserver les feuilles de soins et justificatifs." },
      { q: "À quel moment de la grossesse consulter une sage-femme ?", a: "Il est recommandé de consulter dès la confirmation de la grossesse, idéalement au cours du premier trimestre. Le suivi se poursuit ensuite à un rythme régulier jusqu'à l'accouchement, puis se prolonge par une consultation post-natale pour la mère et le nouveau-né." },
      { q: "Comment prendre rendez-vous avec une sage-femme au Maroc ?", a: "Sur SantéauMaroc, filtrez par spécialité « Sage-femme » et par ville pour trouver une praticienne proche de chez vous. Vous pouvez consulter son profil, ses langues et ses modalités, puis réserver votre rendez-vous en ligne gratuitement en quelques clics." },
      { q: "Une sage-femme peut-elle prescrire des médicaments ou des examens au Maroc ?", a: "Oui, dans le cadre de ses compétences, la sage-femme peut prescrire certains examens de suivi de grossesse (échographies, analyses sanguines, sérologies) ainsi que des traitements liés à la physiologie de la grossesse et à la contraception. Son champ de prescription reste toutefois plus restreint que celui d'un médecin. En cas de pathologie ou de grossesse à risque, elle oriente vers un gynécologue-obstétricien." },
      { q: "Peut-on faire suivre une grossesse à risque uniquement par une sage-femme ?", a: "Non. La sage-femme assure le suivi des grossesses physiologiques, c'est-à-dire sans complication. Dès qu'un risque est identifié (hypertension, diabète gestationnel, grossesse multiple, antécédents lourds), un suivi conjoint ou une prise en charge par un gynécologue-obstétricien devient nécessaire. Ce travail en réseau est fréquent au Maroc et vise votre sécurité et celle du bébé." },
      { q: "La sage-femme se déplace-t-elle à domicile au Maroc ?", a: "Certaines sages-femmes libérales proposent des visites à domicile, notamment pour le suivi post-natal, la rééducation du périnée ou l'accompagnement de l'allaitement. Ce service dépend de la disponibilité de la praticienne et de votre ville. Les tarifs des visites à domicile sont libres et généralement plus élevés qu'en cabinet ; il est conseillé de les confirmer lors de la prise de rendez-vous." },
    ],
    essentiel: [
      { value: "200 – 400 MAD", label: "Tarif d'une consultation" },
      { value: "Grossesse physiologique", label: "Champ d'action principal" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Le suivi de grossesse et la préparation à la naissance",
        body: [
          "Le cœur du métier de sage-femme est le suivi des grossesses sans risque particulier. À chaque consultation, elle surveille le déroulement de la grossesse : prise de tension, poids, hauteur utérine, écoute des bruits du cœur du bébé et prescription des examens recommandés. Elle informe la future mère sur l'hygiène de vie, l'alimentation et les signes qui doivent alerter durant la grossesse.",
          "La préparation à la naissance et à la parentalité occupe une place importante. À travers des séances individuelles ou collectives, la sage-femme aide la femme à aborder l'accouchement plus sereinement : respiration, gestion de la douleur, positions, allaitement et accueil du nouveau-né. Cet accompagnement de proximité est particulièrement précieux pour les premières grossesses.",
        ],
      },
      {
        h: "L'accouchement et la prise en charge du nouveau-né",
        body: [
          "La sage-femme est habilitée à pratiquer les accouchements normaux. Elle surveille le travail, accompagne la femme durant les contractions, réalise l'accouchement eutocique et assure les premiers soins au nouveau-né, dont l'examen initial et la mise au sein précoce. Au Maroc, elle intervient dans les maisons d'accouchement, les centres de santé, les maternités publiques et les cliniques privées.",
          "En cas de complication (souffrance fœtale, hémorragie, présentation anormale, échec de progression), elle fait appel sans délai au gynécologue-obstétricien pour une prise en charge médicale ou une césarienne. Cette collaboration entre sage-femme et médecin est essentielle à la sécurité de la mère et de l'enfant, et constitue un pilier de la réduction de la mortalité maternelle et néonatale.",
        ],
      },
      {
        h: "Le suivi post-natal de la mère et du bébé",
        body: [
          "Après la naissance, la sage-femme assure le suivi de la mère : surveillance de la cicatrisation, contrôle du retour à la normale de l'utérus, dépistage d'une éventuelle infection ou d'une baisse de moral (baby blues, dépression post-partum). Elle accompagne aussi la mise en place de l'allaitement et répond aux nombreuses questions des premiers jours.",
          "Le nouveau-né bénéficie lui aussi d'une surveillance : poids, alimentation, ictère, cicatrisation du cordon et bon développement. La consultation post-natale, quelques semaines après l'accouchement, permet de faire le point sur la santé de la mère, de reprendre une contraception et d'évaluer la nécessité d'une rééducation périnéale.",
        ],
      },
      {
        h: "Contraception, frottis et santé de la femme",
        body: [
          "En dehors de la grossesse, la sage-femme joue un rôle en santé sexuelle et reproductive. Elle réalise des consultations de contraception, aide au choix de la méthode la plus adaptée (pilule, dispositif intra-utérin, implant, préservatif) et assure le suivi de la contraception dans le temps. Cet accompagnement contribue à un meilleur espacement des naissances.",
          "Elle pratique également le frottis cervico-utérin, examen simple et rapide de dépistage du cancer du col de l'utérus, et sensibilise les femmes à l'intérêt d'un suivi régulier. Lorsqu'une anomalie est détectée ou qu'un problème gynécologique dépasse son champ d'action, elle oriente la patiente vers un gynécologue.",
        ],
      },
      {
        h: "Parcours de soins et remboursement au Maroc",
        body: [
          "Au Maroc, le suivi par une sage-femme s'inscrit dans le parcours de santé maternelle. Dans le secteur public, le suivi de grossesse et l'accouchement dans les structures de santé sont très accessibles, souvent gratuits ou à faible coût, ce qui favorise la santé de proximité, y compris en milieu rural. Dans le secteur libéral, les honoraires sont libres et varient selon la ville et la nature des actes.",
          "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel des consultations, du suivi de grossesse et de l'accouchement, selon la tarification nationale de référence (TNR). Il est recommandé de vérifier auprès de sa caisse les modalités et de conserver l'ensemble des justificatifs afin de faciliter le remboursement.",
        ],
      },
      {
        h: "Rééducation périnéale et accompagnement de l'allaitement",
        body: [
          "Après l'accouchement, la sage-femme joue un rôle central dans la récupération du corps de la mère. La rééducation périnéale, qui vise à retonifier les muscles du plancher pelvien, aide à prévenir les fuites urinaires et les descentes d'organes ; elle est généralement débutée quelques semaines après la naissance, une fois le bilan post-natal réalisé. La sage-femme peut également proposer des exercices de rééducation abdominale douce, adaptés à votre état et à votre mode d'accouchement.",
          "L'accompagnement de l'allaitement est un autre volet essentiel de son intervention. La sage-femme aide à corriger la position de bébé au sein, à soulager les crevasses et les engorgements, et à rassurer les jeunes mères confrontées aux doutes des premiers jours. En cas de choix ou de nécessité d'un allaitement au biberon, elle vous conseille aussi sur les bonnes pratiques. Ces soins sont proposés au cabinet et, selon les praticiennes, à domicile ; en cas de fièvre élevée, de douleur intense au sein ou de tout signe inquiétant chez le nourrisson, contactez rapidement un médecin ou le 15 (SAMU).",
        ],
      },
    ],
    prix: {
      title: "Tarifs d'une sage-femme au Maroc",
      intro: "Dans le secteur libéral, les honoraires des sages-femmes sont libres et varient selon la ville, l'expérience et le type de prise en charge. Voici des fourchettes indicatives observées en 2026.",
      rows: [
        { label: "Consultation (grandes villes)", value: "200 – 400 MAD" },
        { label: "Consultation (autres villes)", value: "150 – 300 MAD" },
        { label: "Séance de préparation à la naissance", value: "150 – 350 MAD" },
        { label: "Consultation post-natale", value: "200 – 400 MAD" },
        { label: "Frottis / consultation de contraception", value: "200 – 400 MAD" },
      ],
      note: "Fourchettes indicatives 2026, à titre informatif. Le suivi dans le secteur public est très accessible, souvent gratuit ou à faible coût. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel selon la tarification nationale de référence (TNR).",
    },
  },

  "psychologie": {
    synonyme: "psychologue",
    synonymePluriel: "psychologues",
    reviewed: "2026-07-05",
    description:
      "Le psychologue est un professionnel de la santé mentale qui accompagne, écoute et aide à surmonter les difficultés psychologiques par la parole et des techniques adaptées, comme les thérapies cognitivo-comportementales (TCC). Au Maroc, il intervient face à l'anxiété, la dépression, le stress, le deuil, les troubles du sommeil, les difficultés relationnelles ou les problématiques de l'enfant et du couple. Contrairement au psychiatre, qui est médecin et prescrit des médicaments, le psychologue ne délivre aucune ordonnance : son travail repose sur l'accompagnement thérapeutique et le soutien émotionnel, dans un cadre strictement confidentiel. On le consulte dans le privé, en cabinet, mais aussi dans certaines structures publiques, associations et centres scolaires ou universitaires. La demande de suivi psychologique progresse au Maroc, portée par une prise de conscience croissante et une déstigmatisation progressive des soins de santé mentale. Sur SantéauMaroc, vous pouvez trouver un psychologue près de chez vous, comparer les profils et prendre rendez-vous en ligne gratuitement.",
    quandConsulter: [
      "Anxiété persistante, crises d'angoisse ou stress qui envahissent le quotidien",
      "Tristesse durable, perte d'envie ou signes évocateurs d'une dépression",
      "Deuil, rupture, traumatisme ou événement difficile à surmonter",
      "Difficultés de l'enfant : scolarité, comportement, sommeil ou émotions",
      "Tensions de couple, conflits familiaux ou difficultés relationnelles répétées",
    ],
    faqs: [
      { q: "Quelle est la différence entre un psychologue et un psychiatre au Maroc ?", a: "Le psychiatre est un médecin : il diagnostique, prescrit des médicaments et prend en charge les troubles psychiques sévères. Le psychologue n'est pas médecin et ne prescrit pas ; il propose un accompagnement par la parole et des thérapies comme les TCC. Les deux peuvent se compléter pour un suivi global." },
      { q: "Combien coûte une consultation chez un psychologue au Maroc ?", a: "Les honoraires sont libres dans le privé. Comptez généralement entre 300 et 500 MAD par séance à Casablanca, Rabat ou Marrakech, et souvent entre 250 et 400 MAD dans les autres villes. Le tarif varie selon l'expérience du praticien, la durée de la séance et le type de thérapie." },
      { q: "Les séances de psychologue sont-elles remboursées au Maroc ?", a: "La prise en charge des consultations de psychologue reste limitée. Certaines assurances complémentaires privées peuvent rembourser une partie des séances selon le contrat. Les remboursements CNSS ou AMO concernent surtout les actes médicaux ; vérifiez toujours les conditions de votre couverture avant d'entamer un suivi." },
      { q: "Comment se déroule une première séance chez le psychologue ?", a: "La première séance est un entretien d'évaluation : le psychologue vous écoute, cerne votre demande et vos difficultés, puis propose un cadre de travail. C'est aussi le moment de poser vos questions. Tout ce qui est échangé reste strictement confidentiel." },
      { q: "Un psychologue peut-il recevoir les enfants et les couples ?", a: "Oui. De nombreux psychologues sont spécialisés dans l'accompagnement de l'enfant et de l'adolescent, ou dans la thérapie de couple et familiale. Le suivi est alors adapté : jeux et supports pour l'enfant, séances communes pour le couple. Précisez votre besoin lors de la prise de rendez-vous." },
      { q: "Comment prendre rendez-vous avec un psychologue au Maroc ?", a: "Sur SantéauMaroc, filtrez par la spécialité « psychologie » et par votre ville pour afficher les psychologues disponibles près de chez vous. Consultez leur profil, leurs domaines d'expertise et leurs langues, puis réservez votre rendez-vous en ligne gratuitement, à l'horaire qui vous convient." },
      { q: "Peut-on consulter un psychologue en ligne (téléconsultation) au Maroc ?", a: "Oui, de nombreux psychologues au Maroc proposent des séances par visioconférence, une option pratique pour les personnes éloignées des grandes villes, les Marocains résidant à l'étranger (MRE) ou celles à mobilité réduite. La téléconsultation convient bien au suivi psychothérapeutique et à l'accompagnement du stress ou de l'anxiété. Elle reste toutefois déconseillée en situation de crise aiguë ou de risque suicidaire, où il faut contacter le SAMU (15) ou se rendre aux urgences." },
      { q: "À quelle fréquence et pendant combien de temps faut-il voir un psychologue ?", a: "Le rythme le plus courant est d'une séance par semaine ou toutes les deux semaines, chaque séance durant généralement de 45 minutes à une heure. La durée totale du suivi varie selon le motif : quelques séances pour un accompagnement ponctuel, plusieurs mois pour un travail psychothérapeutique de fond. Le psychologue ajuste ce cadre avec vous et il n'existe aucun engagement obligatoire de durée." },
      { q: "Comment vérifier qu'un psychologue est réellement qualifié au Maroc ?", a: "Assurez-vous que le praticien détient un diplôme universitaire en psychologie (licence puis master ou équivalent) et privilégiez une formation reconnue. Vous pouvez lui demander directement son parcours, sa spécialisation (clinique, enfant, couple…) et son approche thérapeutique. Sur SantéauMaroc, la fiche du psychologue précise sa formation et ses domaines de prise en charge afin de vous aider à choisir en confiance." },
    ],
    essentiel: [
      { value: "300 – 500 MAD", label: "Tarif d'une séance" },
      { value: "Sans ordonnance", label: "Ne prescrit pas de médicaments" },
      { value: "Selon contrat", label: "Prise en charge assurance privée" },
    ],
    sections: [
      {
        h: "Les motifs de consultation les plus fréquents",
        body: [
          "Le psychologue accompagne un large éventail de difficultés : anxiété, crises d'angoisse, stress chronique, épuisement, troubles du sommeil, mais aussi états dépressifs, perte de confiance ou mal-être diffus. Il intervient également après un choc, un deuil, une séparation ou un traumatisme, pour aider la personne à retrouver un équilibre.",
          "Au Maroc, la souffrance psychique reste souvent tue par pudeur ou crainte du jugement. Consulter un psychologue n'est pas réservé aux situations graves : c'est une démarche utile dès que le quotidien devient pesant. Un accompagnement précoce facilite souvent la reprise en main et évite l'aggravation des symptômes.",
        ],
      },
      {
        h: "Les approches et thérapies proposées",
        body: [
          "Le psychologue s'appuie sur des méthodes reconnues. Les thérapies cognitivo-comportementales (TCC) aident à identifier et modifier les pensées et comportements sources de souffrance ; elles sont efficaces pour l'anxiété, les phobies et la dépression. D'autres approches existent : soutien psychologique, thérapies humanistes, thérapie de couple ou familiale, prise en charge de l'enfant par le jeu.",
          "Le choix de l'approche dépend de la demande, de la personnalité et des objectifs de chacun. Le nombre de séances varie : quelques rendez-vous pour une difficulté ponctuelle, un suivi plus long pour un travail de fond. Le rythme se définit avec le praticien, souvent une séance par semaine ou tous les quinze jours.",
        ],
      },
      {
        h: "Psychologue, psychiatre, psychothérapeute : bien s'orienter",
        body: [
          "La distinction est essentielle. Le psychologue est titulaire d'un diplôme universitaire en psychologie ; il n'est pas médecin et ne prescrit pas de médicaments. Le psychiatre, lui, est un médecin spécialiste qui peut poser un diagnostic et prescrire un traitement, notamment pour les troubles sévères. Le titre de psychothérapeute désigne une pratique de la psychothérapie, exercée par certains psychologues ou médecins.",
          "En cas de troubles importants nécessitant un traitement, psychologue et psychiatre travaillent volontiers ensemble. Si vous hésitez, un premier rendez-vous permet d'être orienté vers le bon professionnel. L'essentiel est de se sentir en confiance avec l'intervenant choisi.",
        ],
      },
      {
        h: "Confidentialité et cadre de la prise en charge",
        body: [
          "Tout ce qui se dit en séance est couvert par le secret professionnel : le psychologue est tenu à une stricte confidentialité, ce qui constitue le fondement de la relation de confiance. Rien n'est partagé sans votre accord, sauf situations exceptionnelles prévues par la loi, comme un danger grave pour vous-même ou pour autrui.",
          "Le suivi peut se faire en cabinet, mais aussi à distance par visioconsultation, pratique qui s'est développée au Maroc et facilite l'accès aux soins, notamment dans les villes moins bien pourvues. Le cadre, la durée des séances et les modalités sont posés dès le départ pour un accompagnement clair et serein.",
        ],
      },
      {
        h: "Coût, prise en charge et accès aux soins",
        body: [
          "Dans le secteur privé, les honoraires sont libres et varient selon la ville, l'expérience et la durée des séances. Contrairement aux consultations médicales, les séances de psychologue ne bénéficient pas d'un remboursement systématique par la CNSS ou l'AMO ; certaines assurances complémentaires privées peuvent en couvrir une partie selon le contrat souscrit.",
          "Des alternatives existent pour un accès plus accessible : centres de santé mentale publics, cellules d'écoute universitaires, associations et lignes d'aide. En cas de détresse psychologique aiguë ou de risque immédiat, il ne faut pas hésiter à contacter les urgences (SAMU 15) ou à se rendre au service d'urgence le plus proche.",
        ],
      },
      {
        h: "Le statut du psychologue au Maroc : titre, cadre et limites",
        body: [
          "Au Maroc, le titre de psychologue s'appuie sur une formation universitaire en psychologie (licence puis master), distincte de celle du psychiatre, qui est un médecin. Le psychologue accompagne, évalue et mène des psychothérapies, mais il ne pose pas de diagnostic médical et n'a pas le droit de prescrire des médicaments. Cette distinction est essentielle pour orienter votre demande vers le bon professionnel.",
          "L'organisation de la profession continue de se structurer au Maroc, avec des associations professionnelles qui œuvrent à la reconnaissance et à l'encadrement du métier. En pratique, il est donc recommandé de vérifier la formation du praticien et de rester attentif à son champ d'intervention. Lorsqu'un trouble nécessite un traitement médicamenteux ou relève d'une urgence psychiatrique, le psychologue vous réoriente vers un psychiatre ou vers les urgences (SAMU 15).",
        ],
      },
    ],
    prix: {
      title: "Tarifs d'un psychologue au Maroc",
      intro: "Les honoraires des psychologues sont libres dans le privé. Voici des fourchettes indicatives constatées selon la ville et le type de prise en charge.",
      rows: [
        { label: "Séance individuelle (grandes villes)", value: "300 – 500 MAD" },
        { label: "Séance individuelle (autres villes)", value: "250 – 400 MAD" },
        { label: "Séance de couple ou familiale", value: "400 – 700 MAD" },
        { label: "Suivi de l'enfant / adolescent", value: "300 – 500 MAD" },
        { label: "Téléconsultation (visio)", value: "250 – 450 MAD" },
      ],
      note: "Tarifs indicatifs 2026, à titre d'orientation. Les séances de psychologue ne sont pas systématiquement remboursées par la CNSS ou l'AMO ; certaines assurances complémentaires privées peuvent en couvrir une partie selon le contrat.",
    },
  },

  "allergologie": {
    synonyme: "allergologue",
    reviewed: "2026-07-05",
    description:
      "L'allergologie est la spécialité médicale dédiée au diagnostic et au traitement des allergies : rhinite allergique, asthme allergique, allergies alimentaires ou médicamenteuses, urticaire, eczéma et réactions aux piqûres d'insectes. Au Maroc, l'allergologue intervient dans un contexte marqué par une forte exposition aux pollens, à la poussière domestique et aux acariens, particulièrement dans les grandes agglomérations comme Casablanca, Rabat ou Fès. Les motifs de consultation les plus fréquents concernent le nez qui coule et les éternuements à répétition au printemps, les crises d'asthme et les réactions cutanées. Le praticien s'appuie sur un interrogatoire précis, des tests cutanés (prick-tests) et parfois des dosages sanguins pour identifier l'allergène en cause. Il propose ensuite un traitement adapté et, dans certains cas, une désensibilisation (immunothérapie). L'allergologie s'exerce en secteur public (CHU, hôpitaux) comme en cabinet privé. Sur SantéauMaroc, vous pouvez trouver un allergologue près de chez vous et réserver votre consultation en ligne gratuitement.",
    quandConsulter: [
      "Éternuements, nez bouché ou qui coule et yeux qui piquent, surtout au printemps ou en présence de poussière",
      "Crises d'asthme, essoufflement ou toux persistante, notamment à l'effort ou la nuit",
      "Réaction après un aliment, un médicament ou une piqûre d'insecte (rougeurs, gonflement, démangeaisons)",
      "Plaques d'urticaire, eczéma récidivant ou démangeaisons cutanées inexpliquées",
      "Besoin d'identifier un allergène par des tests cutanés ou d'envisager une désensibilisation",
    ],
    faqs: [
      { q: "Combien coûte une consultation chez un allergologue au Maroc ?", a: "Dans le privé, une consultation d'allergologie coûte généralement entre 300 et 500 MAD dans les grandes villes comme Casablanca ou Rabat, et entre 250 et 400 MAD ailleurs. Les honoraires sont libres et varient selon le praticien. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur la base du tarif national de référence." },
      { q: "Comment prendre rendez-vous avec un allergologue au Maroc ?", a: "Sur SantéauMaroc, filtrez par la spécialité « Allergologie » et par votre ville pour afficher les praticiens proches de chez vous. Vous pouvez consulter leurs coordonnées et réserver votre rendez-vous en ligne gratuitement, à toute heure. Pensez à noter vos symptômes et vos traitements en cours avant la consultation." },
      { q: "Comment se déroulent les tests cutanés (prick-tests) ?", a: "Le médecin dépose de petites gouttes d'allergènes sur l'avant-bras, puis pique légèrement la peau à travers chaque goutte. Une réaction (rougeur, petit gonflement) apparaît en 15 à 20 minutes si vous êtes sensibilisé. L'examen est peu douloureux et bien toléré, y compris chez l'enfant. Certains médicaments antihistaminiques doivent être arrêtés quelques jours avant." },
      { q: "La désensibilisation est-elle efficace ?", a: "La désensibilisation (immunothérapie allergénique) vise à réduire durablement les symptômes face à un allergène identifié, comme les acariens ou les pollens. Elle se fait par voie sublinguale ou par injections, sur plusieurs années. Son efficacité dépend de l'allergène et du respect du protocole ; l'allergologue évalue si elle est indiquée dans votre cas." },
      { q: "Faut-il une lettre du médecin traitant pour voir un allergologue ?", a: "L'accès direct à un allergologue est possible dans le secteur privé. Un courrier de votre médecin généraliste, pédiatre ou pneumologue facilite néanmoins le suivi et peut être demandé dans le parcours de soins CNSS ou AMO pour optimiser le remboursement. Apportez vos examens et ordonnances antérieurs." },
      { q: "Un enfant peut-il consulter un allergologue ?", a: "Oui, les allergies débutent souvent dès l'enfance (asthme, eczéma, allergies alimentaires). De nombreux allergologues reçoivent les enfants, et certains pédiatres sont formés à l'allergologie. Les tests cutanés sont réalisables dès le plus jeune âge. Une prise en charge précoce améliore le confort de vie et prévient les complications." },
      { q: "Faut-il arrêter les antihistaminiques avant les tests d'allergie ?", a: "Oui, les antihistaminiques faussent les prick-tests et doivent être arrêtés en général 5 à 7 jours avant le rendez-vous, selon la molécule. Signalez à l'allergologue tous vos médicaments, y compris certains antidépresseurs et sirops contre la toux qui contiennent des antihistaminiques. En revanche, la plupart des traitements de fond de l'asthme et les corticoïdes inhalés peuvent être poursuivis, mais confirmez toujours les consignes exactes lors de la prise de rendez-vous." },
      { q: "Quelle est la différence entre une allergie et une intolérance alimentaire ?", a: "L'allergie alimentaire met en jeu le système immunitaire et peut déclencher des réactions rapides et parfois graves (urticaire, gonflement, choc anaphylactique). L'intolérance, comme l'intolérance au lactose, est un trouble digestif sans mécanisme immunitaire et n'entraîne pas de risque vital. Seul l'allergologue peut faire la distinction grâce à l'interrogatoire et aux tests adaptés, car la prise en charge et l'urgence diffèrent totalement." },
      { q: "Que faire en cas de réaction allergique grave (anaphylaxie) ?", a: "Une réaction grave associe souvent gêne respiratoire, gonflement du visage ou de la gorge, malaise ou urticaire étendu : c'est une urgence vitale. Appelez immédiatement le 15 (SAMU) et, si un stylo d'adrénaline auto-injectable vous a été prescrit, utilisez-le sans attendre dans la cuisse. Allongez la personne, jambes surélevées, et ne la laissez pas seule. Après tout épisode d'anaphylaxie, une consultation allergologique s'impose pour identifier le déclencheur." },
    ],
    essentiel: [
      { value: "300 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Prick-tests", label: "Diagnostic de référence des allergies" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les allergies les plus fréquentes au Maroc",
        body: [
          "La rhinite allergique figure parmi les motifs de consultation les plus courants. Elle se manifeste par des éternuements, un nez bouché ou qui coule et des yeux irrités, souvent déclenchés par les pollens au printemps, par les acariens de la poussière domestique ou par les poils d'animaux. Dans les grandes villes marocaines, la pollution urbaine peut aggraver ces symptômes.",
          "L'asthme allergique, les allergies alimentaires (arachide, fruits à coque, lait, œuf, poisson) et les allergies médicamenteuses complètent le tableau. S'y ajoutent l'urticaire, l'eczéma atopique et les réactions aux piqûres d'insectes. L'allergologue distingue une allergie vraie d'une simple intolérance et identifie précisément le ou les allergènes responsables.",
        ],
      },
      {
        h: "Les examens et actes de l'allergologue",
        body: [
          "Le diagnostic repose d'abord sur un interrogatoire détaillé : nature des symptômes, moment de survenue, environnement, antécédents familiaux. Le médecin réalise ensuite des tests cutanés (prick-tests), examen de référence qui expose la peau à différents allergènes pour repérer une sensibilisation en quelques minutes.",
          "Selon les cas, l'allergologue prescrit des dosages sanguins (IgE spécifiques), des tests de provocation encadrés ou des explorations respiratoires comme la spirométrie pour l'asthme. Ces examens permettent d'établir un diagnostic fiable et de bâtir une stratégie de traitement personnalisée, qu'il s'agisse d'éviction, de médicaments ou de désensibilisation.",
        ],
      },
      {
        h: "Traitement et désensibilisation",
        body: [
          "La prise en charge associe l'éviction de l'allergène quand elle est possible, des traitements symptomatiques (antihistaminiques, corticoïdes locaux, sprays nasaux, bronchodilatateurs pour l'asthme) et l'éducation du patient à reconnaître et gérer ses crises. Un plan d'action écrit est souvent remis, notamment en cas d'asthme ou de risque d'anaphylaxie.",
          "Lorsque l'allergène est bien identifié, l'allergologue peut proposer une désensibilisation (immunothérapie), par comprimés ou gouttes sous la langue ou par injections. Ce traitement de fond, poursuivi plusieurs années, vise à réduire durablement la réactivité de l'organisme et à diminuer le recours aux médicaments quotidiens.",
        ],
      },
      {
        h: "Prévention et vie quotidienne",
        body: [
          "Réduire l'exposition aux allergènes améliore nettement le confort. Contre les acariens : aérer, laver le linge de lit à haute température, limiter tapis et moquettes. Contre les pollens : suivre les périodes de pollinisation, aérer tôt le matin et éviter les activités extérieures aux pics. Pour les animaux, limiter l'accès aux chambres.",
          "En cas d'allergie alimentaire ou médicamenteuse, la lecture attentive des étiquettes et la déclaration à chaque soignant sont essentielles. Les personnes à risque d'anaphylaxie doivent disposer d'un stylo d'adrénaline et savoir l'utiliser. Face à un gonflement de la gorge, une gêne respiratoire brutale ou un malaise, appelez immédiatement le 15 (SAMU).",
        ],
      },
      {
        h: "Parcours de soins et remboursement",
        body: [
          "L'allergologie s'exerce au Maroc en secteur public (CHU et hôpitaux, avec des délais parfois longs) et en cabinet privé, où l'accès est plus rapide. Le généraliste, le pédiatre ou le pneumologue orientent fréquemment vers l'allergologue lorsque les symptômes persistent ou nécessitent des tests spécialisés.",
          "Dans le privé, les honoraires sont libres. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation, calculé sur la base du tarif national de référence, ainsi que des examens prescrits selon leur cotation. Conservez feuilles de soins, ordonnances et factures pour constituer votre dossier de remboursement.",
        ],
      },
      {
        h: "Allergies et asthme : un lien à ne pas négliger",
        body: [
          "Chez de nombreux patients, l'allergie respiratoire et l'asthme sont étroitement liés : la rhinite allergique mal contrôlée peut aggraver l'asthme, et inversement. L'allergologue évalue cette « voie respiratoire unique » en recherchant les déclencheurs communs (acariens, pollens, poils d'animaux, moisissures fréquentes dans l'habitat humide) et en mesurant le retentissement sur le souffle. Une prise en charge globale du nez et des bronches donne de meilleurs résultats qu'un traitement isolé des symptômes.",
          "Au Maroc, le climat contrasté selon les régions influence l'exposition : forte concentration d'acariens sur le littoral humide, pics polliniques au printemps à l'intérieur des terres, et poussières en période sèche. L'allergologue adapte les conseils d'éviction et le traitement de fond à ce contexte, en coordination avec le pneumologue si l'asthme est sévère. En cas de crise d'asthme aiguë avec essoufflement important qui ne cède pas au traitement de secours, il faut appeler le 15 (SAMU) sans attendre.",
        ],
      },
    ],
    prix: {
      title: "Tarifs indicatifs en allergologie au Maroc",
      intro: "Les honoraires en allergologie sont libres dans le secteur privé et varient selon la ville, le praticien et les examens réalisés. Voici des fourchettes indicatives observées en 2026.",
      rows: [
        { label: "Consultation d'allergologie (grandes villes)", value: "300 – 500 MAD" },
        { label: "Consultation d'allergologie (autres villes)", value: "250 – 400 MAD" },
        { label: "Tests cutanés (prick-tests, batterie)", value: "400 – 900 MAD" },
        { label: "Dosage sanguin d'IgE spécifiques", value: "300 – 800 MAD" },
        { label: "Séance / suivi de désensibilisation", value: "200 – 500 MAD" },
      ],
      note: "Fourchettes indicatives 2026, à titre d'information et sans valeur contractuelle. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur la base du tarif national de référence. Demandez un devis au praticien avant tout examen.",
    },
  },

  "medecine-du-sport": {
    synonyme: "médecin du sport",
    synonymePluriel: "médecins du sport",
    reviewed: "2026-07-05",
    description:
      "La médecine du sport est la spécialité qui accompagne les sportifs de tous niveaux, du licencié amateur au compétiteur, ainsi que les personnes qui reprennent une activité physique. Au Maroc, le médecin du sport intervient surtout dans le secteur privé et au sein de fédérations, de clubs et de centres médico-sportifs, avec une présence marquée à Casablanca, Rabat et Marrakech. Il délivre le certificat médical de non contre-indication à la pratique sportive, réalise le bilan d'aptitude et le test d'effort, prévient et soigne les blessures (entorses, tendinites, lésions musculaires), organise la reprise après blessure et conseille sur la nutrition et l'hydratation. La demande de certificats est fréquente au Maroc, notamment pour les inscriptions en club, les compétitions et le milieu scolaire. Les honoraires sont libres dans le privé et varient selon la ville et les examens réalisés. Les assurés CNSS ou AMO peuvent bénéficier d'un remboursement partiel de la consultation médicale. Sur SantéauMaroc, vous trouvez un médecin du sport près de chez vous et réservez en ligne gratuitement.",
    quandConsulter: [
      "Vous avez besoin d'un certificat médical de non contre-indication pour vous inscrire en club, participer à une compétition ou reprendre le sport",
      "Vous ressentez une douleur persistante après l'effort (tendinite, douleur du genou, de l'épaule ou du tendon d'Achille)",
      "Vous avez subi une blessure sportive (entorse, claquage, déchirure musculaire) et souhaitez une prise en charge et une reprise encadrée",
      "Vous souhaitez un bilan d'aptitude ou un test d'effort avant de démarrer une activité intense ou de reprendre après une longue interruption",
      "Vous cherchez des conseils personnalisés en nutrition, hydratation et prévention des blessures pour améliorer vos performances",
    ],
    faqs: [
      { q: "Combien coûte une consultation chez un médecin du sport au Maroc ?", a: "Les honoraires sont libres dans le secteur privé. Une consultation coûte généralement entre 300 et 600 MAD dans les grandes villes comme Casablanca, Rabat ou Marrakech, et entre 250 et 450 MAD ailleurs. Les examens complémentaires (test d'effort, échographie) sont facturés en plus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel." },
      { q: "Comment prendre rendez-vous avec un médecin du sport au Maroc ?", a: "Sur SantéauMaroc, filtrez par la spécialité « Médecine du sport » et par votre ville pour comparer les praticiens disponibles. Vous consultez leurs disponibilités et réservez en ligne gratuitement, en quelques clics. Vous pouvez aussi préciser le motif (certificat, blessure, bilan) lors de la prise de rendez-vous." },
      { q: "Le médecin du sport délivre-t-il le certificat de non contre-indication ?", a: "Oui, c'est l'un de ses actes les plus courants. Après un examen clinique (et parfois un électrocardiogramme ou un test d'effort selon l'âge et le sport), il délivre le certificat de non contre-indication à la pratique du sport, en loisir ou en compétition. Ce document est souvent exigé par les clubs et les fédérations." },
      { q: "Quand un test d'effort est-il nécessaire ?", a: "Le test d'effort est recommandé avant une pratique intense ou en compétition, chez les sportifs de plus de 35-40 ans, en cas de facteurs de risque cardiovasculaire (tabac, hypertension, diabète, antécédents familiaux) ou de symptômes à l'effort. Le médecin du sport évalue au cas par cas s'il est indiqué." },
      { q: "Faut-il consulter un médecin du sport ou un kinésithérapeute après une blessure ?", a: "Le médecin du sport pose le diagnostic, prescrit les examens (radiographie, échographie, IRM) et coordonne le traitement, y compris la rééducation. Le kinésithérapeute réalise ensuite les séances de rééducation prescrites. Les deux travaillent souvent en complémentarité pour une reprise sûre." },
      { q: "La consultation de médecine du sport est-elle remboursée au Maroc ?", a: "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation médicale, calculé sur la base du tarif national de référence (TNR). Le certificat purement administratif et certains actes de confort ne sont pas toujours pris en charge. Conservez votre feuille de soins pour votre remboursement." },
      { q: "À quel âge un enfant ou adolescent peut-il consulter un médecin du sport ?", a: "Un enfant ou un adolescent qui pratique une activité intensive ou en compétition peut bénéficier d'un suivi dès le plus jeune âge, souvent à la demande du club ou lors d'un certificat d'aptitude. Le médecin du sport surveille la croissance, adapte les charges d'entraînement et dépiste les pathologies de croissance (comme les douleurs du genou ou du talon fréquentes chez le jeune sportif). Au Maroc, ce suivi se fait dans le privé ou parfois via les structures fédérales pour les sportifs de haut niveau." },
      { q: "Le médecin du sport peut-il faire des infiltrations ?", a: "Oui, un médecin du sport peut réaliser des infiltrations (corticoïdes, acide hyaluronique, voire PRP selon sa formation) pour traiter certaines tendinopathies ou atteintes articulaires. Ce geste est proposé après examen et parfois imagerie, quand les traitements plus simples n'ont pas suffi. Les produits comme le PRP ne sont généralement pas remboursés par la CNSS ou l'AMO et restent à la charge du patient." },
      { q: "Que faire en cas de malaise ou de douleur thoracique pendant l'effort ?", a: "Un malaise, une perte de connaissance ou une douleur dans la poitrine pendant l'effort sont des signaux d'alerte à ne jamais banaliser. Il faut arrêter immédiatement l'activité et, si les symptômes persistent ou s'aggravent, appeler le 15 (SAMU) sans attendre. En dehors de l'urgence, ces signes justifient un bilan cardiologique complet avant toute reprise, souvent orienté par le médecin du sport." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation en grande ville" },
      { value: "Certificat d'aptitude", label: "Acte le plus demandé de la spécialité" },
      { value: "CNSS · AMO", label: "Remboursement partiel de la consultation" },
    ],
    sections: [
      {
        h: "Blessures sportives : les motifs les plus fréquents",
        body: [
          "Le médecin du sport prend en charge la majorité des blessures liées à l'activité physique : entorses de la cheville ou du genou, tendinites (tendon d'Achille, épaule, coude du tennisman), lésions musculaires (claquages, déchirures), douleurs du dos et fractures de fatigue. Ces motifs sont fréquents au Maroc, notamment avec la popularité du football, de la course à pied et du fitness.",
          "La prise en charge commence par un examen clinique précis, complété si besoin par une imagerie (radiographie, échographie, IRM). Le médecin propose ensuite un traitement adapté : repos relatif, glaçage, antalgiques, orthèses, rééducation ou, plus rarement, avis chirurgical. L'objectif est de soulager la douleur tout en préservant l'avenir sportif.",
        ],
      },
      {
        h: "Bilan d'aptitude, test d'effort et certificat",
        body: [
          "Avant de démarrer ou d'intensifier une pratique, le bilan d'aptitude permet d'évaluer l'état cardiovasculaire, respiratoire et articulaire. Il comprend un interrogatoire sur les antécédents, un examen clinique complet et, selon le profil, un électrocardiogramme de repos ou un test d'effort. Ce dépistage vise à écarter les contre-indications et à prévenir les accidents graves à l'effort.",
          "À l'issue du bilan, le médecin du sport délivre le certificat de non contre-indication, exigé pour l'inscription en club, les compétitions et parfois le milieu scolaire. Le test d'effort, réalisé sur tapis ou vélo avec surveillance cardiaque, est particulièrement conseillé aux sportifs de plus de 35-40 ans ou porteurs de facteurs de risque.",
        ],
      },
      {
        h: "Reprise après blessure et prévention",
        body: [
          "La reprise du sport après une blessure est une étape clé, souvent négligée, qui expose aux récidives quand elle est trop précoce. Le médecin du sport définit un calendrier de reprise progressive, adapté au type de lésion et au sport pratiqué, en lien avec le kinésithérapeute. Il valide les critères de retour au terrain pour limiter le risque de rechute.",
          "La prévention occupe une place centrale : échauffement, renforcement musculaire, correction des gestes techniques, choix du matériel et gestion de la charge d'entraînement. Le médecin conseille aussi sur l'hydratation et la récupération, particulièrement importantes lors des fortes chaleurs au Maroc, pour réduire les blessures et les malaises à l'effort.",
        ],
      },
      {
        h: "Nutrition, hydratation et performance",
        body: [
          "L'alimentation influence directement la performance, la récupération et le risque de blessure. Le médecin du sport évalue les besoins énergétiques selon la discipline, la fréquence des entraînements et les objectifs, et corrige les déséquilibres fréquents (apports insuffisants, carences, poids inadapté). Il oriente vers une diététique équilibrée plutôt que vers des régimes ou compléments non justifiés.",
          "L'hydratation est un enjeu majeur au Maroc, où la chaleur augmente les pertes hydriques et le risque de crampes ou de coup de chaleur. Le médecin donne des repères concrets avant, pendant et après l'effort. Il reste vigilant face aux compléments et substances dopantes, et rappelle les règles de sécurité, notamment pour les jeunes sportifs.",
        ],
      },
      {
        h: "Parcours de soins et remboursement au Maroc",
        body: [
          "Au Maroc, le médecin du sport exerce surtout en cabinet privé, en clinique, au sein de fédérations, de clubs professionnels et de centres médico-sportifs. On y accède librement, sans passage obligatoire par un médecin traitant. Selon le motif, il peut collaborer avec des orthopédistes, cardiologues, kinésithérapeutes et radiologues pour une prise en charge complète.",
          "Sur le plan financier, les honoraires sont libres dans le privé. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation médicale, sur la base du tarif national de référence. Certains actes techniques (test d'effort, imagerie) peuvent être partiellement pris en charge sur prescription, tandis que les certificats administratifs ne le sont pas toujours.",
        ],
      },
      {
        h: "Suivi du sportif amateur et du sportif de haut niveau",
        body: [
          "Le médecin du sport n'accompagne pas seulement les athlètes de compétition : il s'adresse aussi au coureur du dimanche, au pratiquant de salle de sport ou à la personne qui reprend une activité après une longue interruption. Chez le sportif amateur, l'objectif est surtout de prévenir les blessures, d'adapter la charge à la condition réelle et de dépister un problème cardiaque ou articulaire avant qu'il ne devienne handicapant.",
          "Chez le sportif de haut niveau, le suivi devient plus rapproché et pluridisciplinaire : bilans réguliers, optimisation de la récupération, prévention du surentraînement et coordination avec le kinésithérapeute, le nutritionniste et l'encadrement du club. Au Maroc, ce suivi renforcé passe souvent par des structures fédérales ou des centres privés spécialisés, tandis que le sportif amateur consulte le plus souvent en cabinet de ville.",
        ],
      },
    ],
    prix: {
      title: "Tarifs de la médecine du sport au Maroc",
      intro: "Les honoraires sont libres dans le secteur privé et varient selon la ville, l'expérience du praticien et les examens réalisés. Voici des fourchettes indicatives constatées en 2026.",
      rows: [
        { label: "Consultation (grandes villes : Casablanca, Rabat, Marrakech)", value: "300 – 600 MAD" },
        { label: "Consultation (autres villes)", value: "250 – 450 MAD" },
        { label: "Certificat de non contre-indication (consultation dédiée)", value: "200 – 400 MAD" },
        { label: "Test d'effort avec électrocardiogramme", value: "500 – 1 200 MAD" },
        { label: "Échographie musculo-tendineuse", value: "300 – 700 MAD" },
      ],
      note: "Fourchettes indicatives 2026, données à titre informatif et non contractuel. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation médicale sur la base du tarif national de référence (TNR). Confirmez toujours les tarifs auprès du cabinet lors de la prise de rendez-vous.",
    },
  },

  "nutrition": {
    synonyme: "nutritionniste",
    synonymePluriel: "nutritionnistes",
    reviewed: "2026-07-05",
    description:
      "La nutrition est la spécialité qui accompagne la prise en charge du poids, du diabète, du cholestérol et de l'équilibre alimentaire au quotidien. Au Maroc, elle prend une place croissante face à la fréquence du surpoids, de l'obésité et du diabète de type 2, aussi bien dans les grandes villes que dans les régions. Il est important de distinguer deux professionnels souvent confondus : le médecin nutritionniste, docteur en médecine capable de poser un diagnostic, de prescrire des examens et des médicaments et de suivre des situations médicales complexes ; et le diététicien, professionnel paramédical spécialisé dans l'élaboration concrète des plans alimentaires et l'éducation nutritionnelle. Les deux exercent en cabinet privé, en clinique ou à l'hôpital public, et travaillent souvent en lien avec l'endocrinologue, le cardiologue ou le médecin traitant. Sur SantéauMaroc, vous pouvez comparer les praticiens par ville, vérifier leurs langues et le conventionnement, puis réserver un rendez-vous en ligne gratuitement.",
    quandConsulter: [
      "Surpoids ou obésité que vous souhaitez traiter durablement, sans régimes répétés inefficaces.",
      "Diabète, prédiabète, cholestérol ou hypertension nécessitant un rééquilibrage alimentaire encadré.",
      "Fatigue, troubles digestifs ou carences suspectées liés à votre alimentation.",
      "Trouble du comportement alimentaire : compulsions, hyperphagie, restriction excessive, rapport difficile à la nourriture.",
      "Suivi nutritionnel spécifique : grossesse, sportif, personne âgée, avant ou après une chirurgie de l'obésité.",
    ],
    faqs: [
      { q: "Quelle différence entre un médecin nutritionniste et un diététicien ?", a: "Le médecin nutritionniste est un docteur en médecine : il peut diagnostiquer, prescrire des analyses et des médicaments et suivre des pathologies. Le diététicien est un professionnel paramédical spécialisé dans les plans alimentaires et l'éducation nutritionnelle, sans prescription médicale. Les deux sont complémentaires selon votre situation." },
      { q: "Combien coûte une consultation de nutrition au Maroc ?", a: "Dans le privé, les honoraires sont libres. Comptez en général 300 à 500 MAD dans les grandes villes comme Casablanca, Rabat ou Marrakech, et 200 à 400 MAD dans les autres villes. La première consultation, plus longue, peut être un peu plus chère. Les tarifs restent indicatifs et varient selon le praticien." },
      { q: "La consultation de nutrition est-elle remboursée ?", a: "Une consultation chez un médecin nutritionniste peut ouvrir droit à un remboursement partiel : les assurés CNSS ou AMO bénéficient d'un remboursement d'environ 80 % du tarif national de référence pour une consultation médicale de base. Les actes des diététiciens et les bilans nutritionnels sont généralement peu ou pas pris en charge." },
      { q: "Faut-il une ordonnance ou une lettre du médecin traitant ?", a: "Non, vous pouvez consulter directement un nutritionniste sans passer par votre médecin traitant. Une lettre ou des bilans récents (glycémie, bilan lipidique, thyroïde) sont toutefois utiles pour orienter la prise en charge. Apportez vos derniers résultats d'analyses si vous en avez." },
      { q: "Combien de séances sont nécessaires pour perdre du poids ?", a: "Il n'existe pas de nombre fixe. Un suivi durable repose souvent sur une première consultation puis des rendez-vous de suivi espacés sur plusieurs mois. L'objectif n'est pas un régime rapide mais un changement d'habitudes stable, adapté à votre mode de vie et à votre santé." },
      { q: "Comment prendre rendez-vous avec un nutritionniste au Maroc ?", a: "Sur SantéauMaroc, filtrez par la spécialité nutrition, choisissez votre ville et comparez les praticiens selon leurs langues, leur conventionnement et leurs disponibilités. Vous pouvez ensuite réserver votre rendez-vous en ligne gratuitement, en quelques clics, à l'horaire qui vous convient." },
      { q: "Le suivi nutritionnel peut-il se faire à distance, en téléconsultation ?", a: "Oui, de nombreux nutritionnistes proposent désormais des rendez-vous de suivi en visioconsultation, pratiques après une première séance en présentiel. Ce format convient bien pour ajuster le plan alimentaire, faire le point sur les analyses ou maintenir la motivation entre deux consultations. La première visite reste souvent recommandée en cabinet pour les mesures et l'examen. Sur SantéauMaroc, vérifiez si le praticien indique proposer la téléconsultation." },
      { q: "Comment bien préparer sa première consultation de nutrition ?", a: "Notez pendant deux ou trois jours ce que vous mangez et buvez réellement, sans rien changer, pour donner une image fidèle de vos habitudes. Apportez vos dernières analyses (glycémie, bilan lipidique, thyroïde, fer), la liste de vos traitements et vos objectifs concrets. Préparez aussi vos questions et vos contraintes de vie (travail, horaires, budget), car un plan réaliste se construit autour de votre quotidien." },
      { q: "L'activité physique est-elle indispensable en plus du suivi alimentaire ?", a: "L'alimentation reste le levier principal, mais bouger régulièrement en renforce fortement les effets sur le poids, le diabète et le cholestérol. Le nutritionniste tient compte de votre condition physique et de vos éventuelles pathologies pour conseiller une activité progressive et adaptée. En cas de maladie cardiaque ou d'obésité importante, un avis médical préalable est prudent avant de reprendre le sport." },
    ],
    essentiel: [
      { value: "300 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Médecin ou diététicien", label: "Deux profils complémentaires" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les motifs de consultation les plus fréquents",
        body: [
          "Le surpoids et l'obésité sont les premières raisons de consultation en nutrition au Maroc, où ces situations sont fréquentes en ville comme à la campagne. Le nutritionniste évalue le poids, la répartition des graisses, les habitudes alimentaires et l'activité physique, puis construit un accompagnement personnalisé plutôt qu'un régime restrictif de courte durée.",
          "Viennent ensuite les maladies métaboliques : diabète de type 2, prédiabète, excès de cholestérol et hypertension artérielle, souvent liés à l'alimentation. Le nutritionniste intervient aussi pour les troubles digestifs, les carences, la nutrition de la femme enceinte, du sportif ou de la personne âgée, ainsi que pour les troubles du comportement alimentaire.",
        ],
      },
      {
        h: "Bilan nutritionnel et examens utiles",
        body: [
          "La consultation commence par un interrogatoire détaillé : antécédents, mode de vie, habitudes alimentaires et objectifs. Le praticien réalise des mesures (poids, taille, tour de taille, parfois composition corporelle) et analyse un carnet alimentaire pour comprendre vos apports réels au quotidien.",
          "Le médecin nutritionniste peut prescrire des examens complémentaires : glycémie à jeun ou hémoglobine glyquée, bilan lipidique, bilan hépatique, thyroïde ou dosages de vitamines et de fer. Ces résultats orientent le plan nutritionnel et permettent de dépister des complications éventuelles, en lien si besoin avec l'endocrinologue ou le cardiologue.",
        ],
      },
      {
        h: "Prévention et rééquilibrage alimentaire",
        body: [
          "La nutrition ne se limite pas à la perte de poids : elle vise avant tout la prévention des maladies chroniques et l'adoption durable de bonnes habitudes. Le praticien aide à structurer les repas, à mieux choisir les aliments et à adapter l'assiette à la culture culinaire marocaine plutôt qu'à imposer un modèle étranger.",
          "L'éducation nutritionnelle occupe une place centrale : comprendre les étiquettes, gérer les sucres et les graisses cachés, adapter l'alimentation pendant le Ramadan ou lors d'un diabète. Cet accompagnement progressif favorise des résultats stables et évite l'effet yo-yo des régimes trop stricts.",
        ],
      },
      {
        h: "Remboursement et parcours de soins",
        body: [
          "Une consultation chez un médecin nutritionniste est un acte médical qui peut donner lieu à un remboursement partiel pour les assurés CNSS ou AMO, généralement calculé sur le tarif national de référence d'une consultation médicale de base. Conservez vos feuilles de soins et justificatifs pour votre demande de remboursement.",
          "Les consultations de diététicien et certains bilans nutritionnels sont en revanche souvent à votre charge dans le privé. La nutrition s'intègre dans un parcours plus large : votre médecin traitant, l'endocrinologue ou le cardiologue peuvent orienter vers un nutritionniste, notamment en cas de diabète ou de maladie cardiovasculaire.",
        ],
      },
      {
        h: "Cas particuliers : chirurgie, TCA et enfant",
        body: [
          "Certaines situations demandent un suivi nutritionnel rapproché. Avant et après une chirurgie de l'obésité (sleeve, bypass), l'accompagnement est indispensable pour préparer l'intervention, prévenir les carences et adapter durablement l'alimentation. Le nutritionniste travaille alors en équipe avec le chirurgien.",
          "Les troubles du comportement alimentaire (anorexie, boulimie, hyperphagie) relèvent d'une prise en charge pluridisciplinaire associant nutritionniste, médecin et parfois psychologue. Chez l'enfant et l'adolescent en surpoids, l'objectif est un accompagnement familial doux, sans régime strict, pour préserver la croissance et le rapport à la nourriture.",
        ],
      },
      {
        h: "Nutrition pendant le Ramadan et le jeûne",
        body: [
          "Le Ramadan modifie profondément le rythme des repas et représente une préoccupation fréquente au Maroc. Le nutritionniste aide à organiser le ftour et le shour pour éviter les excès de sucres rapides et de fritures, maintenir une bonne hydratation entre les deux repas et prévenir la fatigue, les maux de tête ou les fringales nocturnes. L'objectif est de traverser le mois sans déséquilibre ni prise de poids.",
          "Le jeûne demande une vigilance particulière pour les personnes atteintes de diabète, d'hypertension ou de maladie chronique. Un avis médical est indispensable avant de jeûner dans ces situations, car l'adaptation des traitements et des horaires relève du médecin. En cas de malaise, d'hypoglycémie sévère ou de signes de déshydratation importante, il ne faut pas hésiter à rompre le jeûne et à contacter le 15 (SAMU) si l'état est préoccupant.",
        ],
      },
    ],
    prix: {
      title: "Tarifs d'un nutritionniste au Maroc",
      intro: "Dans le secteur privé, les honoraires sont libres et varient selon la ville, le type de praticien (médecin ou diététicien) et la durée de la consultation. Voici des fourchettes indicatives pour vous repérer.",
      rows: [
        { label: "Première consultation (bilan)", value: "350 – 600 MAD" },
        { label: "Consultation de suivi", value: "200 – 400 MAD" },
        { label: "Consultation diététicien", value: "150 – 350 MAD" },
        { label: "Analyse de composition corporelle", value: "100 – 250 MAD" },
        { label: "Programme d'accompagnement (plusieurs séances)", value: "800 – 2 500 MAD" },
      ],
      note: "Tarifs indicatifs 2026, à confirmer auprès du praticien. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel pour une consultation chez un médecin nutritionniste ; les actes des diététiciens sont généralement peu ou pas remboursés.",
    },
  },

  "medecine-esthetique": {
    synonyme: "médecin esthétique",
    reviewed: "2026-07-05",
    description:
      "La médecine esthétique regroupe les actes médicaux non chirurgicaux destinés à corriger ou prévenir les signes du vieillissement et à améliorer l'apparence du visage et du corps. Au Maroc, elle est pratiquée par des médecins formés (dermatologues, médecins esthétiques ou chirurgiens) dans des cabinets privés, surtout à Casablanca, Rabat, Marrakech et Tanger. Les techniques les plus courantes sont les injections d'acide hyaluronique et de toxine botulique (botox), le peeling chimique, la mésothérapie et les traitements au laser. Contrairement à la chirurgie esthétique, ces actes se réalisent sans anesthésie générale, avec peu ou pas d'éviction sociale. Point important : ce sont des actes médicaux réservés aux médecins, sans visée thérapeutique ; ils ne sont donc pas remboursés par la CNSS ni l'AMO. Le choix d'un praticien qualifié et déclaré est essentiel pour votre sécurité. Sur SantéauMaroc, vous pouvez repérer les médecins pratiquant la médecine esthétique près de chez vous et prendre rendez-vous en toute confiance.",
    quandConsulter: [
      "Vous souhaitez atténuer des rides du front, de la patte d'oie ou de la ride du lion",
      "Vous voulez restaurer un volume perdu au niveau des pommettes, des lèvres ou des cernes creux",
      "Votre peau est terne ou présente des taches pigmentaires et des cicatrices d'acné",
      "Vous constatez une chute de cheveux ou un relâchement cutané débutant",
      "Vous envisagez un acte esthétique et cherchez un avis médical préalable sérieux",
    ],
    faqs: [
      { q: "Combien coûte une consultation de médecine esthétique au Maroc ?", a: "Une consultation d'évaluation coûte généralement entre 300 et 600 MAD dans les grandes villes, et entre 250 et 450 MAD ailleurs. Les honoraires sont libres dans le secteur privé et varient selon la ville et le praticien. Cette première consultation, parfois déduite du coût de l'acte, sert à définir un plan de traitement personnalisé." },
      { q: "La médecine esthétique est-elle remboursée par la CNSS ou l'AMO ?", a: "Non. Les actes de médecine esthétique n'ont pas de visée thérapeutique et sont considérés comme du confort : ils ne sont pas remboursés par la CNSS ni par l'AMO. Vous devez régler l'intégralité des honoraires. Seuls certains actes à visée médicale reconnue (traitement d'une pathologie cutanée, par exemple) peuvent parfois ouvrir droit à un remboursement partiel." },
      { q: "Qui peut pratiquer les injections et actes esthétiques au Maroc ?", a: "Les injections (acide hyaluronique, botox), le laser médical et les peelings sont des actes médicaux réservés aux médecins inscrits à l'Ordre. Méfiez-vous des instituts de beauté ou de personnes non médecins qui proposent ces injections : le risque de complications est réel. Vérifiez toujours la qualification du praticien avant tout acte." },
      { q: "Les injections d'acide hyaluronique et de botox sont-elles douloureuses ?", a: "L'inconfort est généralement léger et de courte durée. Une crème anesthésiante ou des produits contenant un anesthésique local sont souvent utilisés pour l'acide hyaluronique. Le botox se fait avec de très fines aiguilles et occasionne peu de gêne. Des rougeurs ou petits bleus transitoires peuvent apparaître et disparaissent en quelques jours." },
      { q: "Combien de temps durent les résultats d'un traitement esthétique ?", a: "Cela dépend de l'acte. Le botox agit environ 4 à 6 mois, l'acide hyaluronique de 6 à 18 mois selon la zone et le produit. Les peelings et la mésothérapie nécessitent souvent plusieurs séances pour un résultat optimal. Le médecin vous précisera le rythme d'entretien lors de la consultation." },
      { q: "Comment prendre rendez-vous avec un médecin esthétique au Maroc ?", a: "Sur SantéauMaroc, filtrez par spécialité « médecine esthétique » et par ville pour trouver un praticien près de chez vous. Vous consultez son profil, ses actes et ses avis, puis vous réservez en ligne gratuitement le créneau qui vous convient. La prise de rendez-vous est simple et sans frais supplémentaires." },
      { q: "Quelle est la différence entre médecine esthétique et chirurgie esthétique ?", a: "La médecine esthétique regroupe des actes non chirurgicaux (injections, peelings, laser, mésothérapie) réalisés au cabinet, sans bloc opératoire ni anesthésie générale. La chirurgie esthétique (lifting, rhinoplastie, liposuccion) est un acte opératoire pratiqué par un chirurgien plasticien, avec anesthésie et une vraie période de récupération. Les deux disciplines sont distinctes et complémentaires ; votre médecin vous orientera vers un chirurgien si votre demande dépasse le champ non chirurgical." },
      { q: "Y a-t-il une éviction sociale après un acte de médecine esthétique ?", a: "La plupart des actes ont peu ou pas d'éviction sociale : après du botox ou de l'acide hyaluronique, vous pouvez reprendre vos activités le jour même, avec parfois de légères rougeurs ou de petits bleus transitoires. Certains actes plus intenses, comme un peeling profond ou un laser fractionné, entraînent des rougeurs et des desquamations pendant quelques jours. Le médecin vous précise à l'avance les suites prévisibles pour organiser votre agenda." },
      { q: "À partir de quel âge peut-on commencer la médecine esthétique ?", a: "Il n'existe pas d'âge unique : cela dépend de la demande et de l'état de la peau, non d'un chiffre. Les actes préventifs légers (hydratation, qualité de peau) peuvent concerner de jeunes adultes, tandis que les corrections de rides s'envisagent plus tard, quand les signes apparaissent. Ces actes sont réservés aux adultes ; un médecin sérieux refuse tout geste esthétique non justifié chez un mineur et privilégie toujours le naturel." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Actes non chirurgicaux", label: "Sans anesthésie générale" },
      { value: "Non remboursé", label: "Acte esthétique de confort" },
    ],
    sections: [
      {
        h: "Les principaux actes de médecine esthétique",
        body: [
          "La médecine esthétique propose une gamme d'actes non chirurgicaux réalisés au cabinet. Les injections de toxine botulique (botox) détendent les muscles responsables des rides d'expression du front et du contour des yeux. Les injections d'acide hyaluronique comblent les rides, restaurent les volumes du visage (pommettes, lèvres, cernes) et hydratent la peau en profondeur.",
          "À ces techniques s'ajoutent le peeling chimique, qui exfolie la peau pour traiter le teint terne, les taches et les cicatrices d'acné, la mésothérapie qui revitalise la peau ou lutte contre la chute de cheveux, et les traitements au laser pour l'épilation, les taches ou le rajeunissement cutané. Le médecin adapte le protocole à votre peau et à vos attentes.",
        ],
      },
      {
        h: "La consultation et le bilan préalable",
        body: [
          "La première consultation est une étape essentielle et jamais anodine. Le médecin analyse votre peau, votre morphologie et vos attentes, recherche d'éventuelles contre-indications (grossesse, allergies, traitements en cours, maladies auto-immunes) et vous informe des résultats réalistes que l'on peut espérer.",
          "C'est aussi le moment d'aborder les risques, les suites possibles et le budget. Un praticien sérieux ne propose jamais un acte sous pression et respecte un temps de réflexion. Un devis clair doit vous être remis. Cette démarche prudente vous protège et garantit que l'acte proposé correspond réellement à vos besoins.",
        ],
      },
      {
        h: "Sécurité, complications et bonnes pratiques",
        body: [
          "Bien que peu invasifs, les actes de médecine esthétique restent des gestes médicaux comportant des risques : ecchymoses, œdème, infection, réaction allergique, ou résultat asymétrique. Certaines complications, comme une occlusion vasculaire après injection d'acide hyaluronique, sont rares mais graves et nécessitent une prise en charge médicale immédiate.",
          "Pour limiter ces risques, choisissez un médecin qualifié utilisant des produits homologués, dans un cabinet respectant les règles d'hygiène. Fuyez les prix anormalement bas et les injections pratiquées hors cadre médical. En cas de douleur intense, de blanchiment de la peau ou de trouble visuel après un acte, contactez sans délai votre praticien ou les urgences (15, SAMU).",
        ],
      },
      {
        h: "Coût et absence de remboursement",
        body: [
          "Les actes de médecine esthétique sont à honoraires libres et intégralement à la charge du patient. N'ayant pas de finalité thérapeutique, ils ne sont pris en charge ni par la CNSS ni par l'AMO. Le budget dépend de l'acte, de la quantité de produit utilisée et du nombre de séances nécessaires.",
          "Il faut donc considérer ces traitements comme un investissement personnel et se méfier des offres trop attractives, souvent synonymes de produits douteux ou de praticiens non qualifiés. Demandez toujours un devis détaillé et privilégiez la qualité et la sécurité plutôt que le prix le plus bas.",
        ],
      },
      {
        h: "Médecine esthétique et cas particuliers",
        body: [
          "Certaines situations imposent une prudence renforcée ou contre-indiquent temporairement les actes esthétiques. Les injections sont déconseillées pendant la grossesse et l'allaitement. Les patients sous anticoagulants, souffrant de maladies auto-immunes ou d'infections cutanées actives doivent en informer le médecin, qui adaptera ou reportera l'acte.",
          "La médecine esthétique peut aussi accompagner un parcours de soins : traitement de cicatrices, de la transpiration excessive (hyperhidrose) par botox, ou prise en charge de troubles cutanés en lien avec le dermatologue. Dans ces cas, l'objectif dépasse le simple confort esthétique et s'inscrit dans une approche médicale globale.",
        ],
      },
      {
        h: "Bien préparer sa peau et suivre les recommandations après l'acte",
        body: [
          "Quelques précautions améliorent le résultat et réduisent les suites. Avant un acte, il est conseillé d'éviter l'alcool et les médicaments qui fluidifient le sang (sauf avis médical), de signaler tout traitement en cours et de venir sur une peau propre, sans maquillage. Pour les traitements au laser ou les peelings, une exposition solaire récente ou un bronzage augmentent le risque de taches : ces actes se planifient souvent en dehors des périodes très ensoleillées.",
          "Après l'acte, suivre les consignes du médecin est essentiel : ne pas masser les zones injectées, éviter le sport intense, la chaleur (hammam, sauna) et l'exposition au soleil pendant la durée indiquée, et appliquer une protection solaire élevée. Ces gestes simples limitent les bleus, l'œdème et les taches, et optimisent la tenue du résultat. En cas de douleur inhabituelle, de blanchiment de la peau ou de trouble visuel, contactez sans délai votre praticien ou les urgences (15, SAMU).",
        ],
      },
    ],
    prix: {
      title: "Tarifs de la médecine esthétique au Maroc",
      intro: "Les honoraires sont libres dans le secteur privé et varient selon la ville, le praticien, les produits utilisés et le nombre de séances. Voici des fourchettes indicatives observées dans les grandes villes marocaines.",
      rows: [
        { label: "Consultation d'évaluation", value: "300 – 600 MAD" },
        { label: "Injection de botox (une zone)", value: "1 500 – 3 000 MAD" },
        { label: "Injection d'acide hyaluronique (une seringue)", value: "2 500 – 5 000 MAD" },
        { label: "Peeling chimique (séance)", value: "600 – 1 500 MAD" },
        { label: "Mésothérapie ou séance de laser", value: "800 – 2 500 MAD" },
      ],
      note: "Tarifs indicatifs 2026, à confirmer auprès du praticien. Les actes de médecine esthétique n'ont pas de visée thérapeutique et ne sont pas remboursés par la CNSS ni l'AMO.",
    },
  },

  "geriatrie": {
    synonyme: "gériatre",
    reviewed: "2026-07-05",
    description:
      "Le gériatre est le médecin spécialiste de la santé des personnes âgées. Au Maroc, où l'espérance de vie progresse et où le vieillissement de la population devient un enjeu de santé publique, cette discipline prend une place croissante. Le gériatre ne traite pas une seule maladie mais prend en charge la polypathologie : la coexistence, chez un même patient, de plusieurs affections chroniques (diabète, hypertension, arthrose, insuffisance cardiaque). Son rôle est aussi de préserver l'autonomie, de prévenir les chutes, de dépister les troubles de la mémoire et la dénutrition, et surtout d'ajuster les traitements pour limiter l'iatrogénie, c'est-à-dire les effets indésirables liés à la prise de nombreux médicaments. La gériatrie reste une spécialité en développement au Maroc, exercée dans les services hospitaliers publics, quelques structures privées et en consultation de ville. Sur SantéauMaroc, vous pouvez identifier les praticiens compétents en gériatrie près de chez vous et organiser une prise en charge adaptée à la personne âgée.",
    quandConsulter: [
      "Chutes répétées, perte d'équilibre ou peur de tomber chez une personne âgée",
      "Troubles de la mémoire, désorientation ou changement de comportement inhabituel",
      "Perte de poids, perte d'appétit ou signes de dénutrition",
      "Multiplication des médicaments et doute sur leur utilité ou leurs effets secondaires",
      "Perte d'autonomie progressive dans les gestes du quotidien (toilette, habillage, marche)",
    ],
    faqs: [
      { q: "Quand faut-il consulter un gériatre ?", a: "Il est utile de consulter un gériatre lorsqu'une personne âgée présente plusieurs maladies chroniques, prend de nombreux médicaments, fait des chutes ou perd progressivement son autonomie. Une évaluation gériatrique est aussi recommandée en cas de troubles de la mémoire, de perte de poids inexpliquée ou avant une décision médicale importante." },
      { q: "Combien coûte une consultation chez un gériatre au Maroc ?", a: "Dans le secteur privé, les honoraires sont libres. Une consultation coûte généralement entre 300 et 600 MAD dans les grandes villes comme Casablanca, Rabat ou Marrakech, et souvent entre 250 et 450 MAD ailleurs. Une première évaluation gériatrique complète, plus longue, peut être facturée davantage. Dans le secteur public hospitalier, les tarifs sont nettement plus accessibles." },
      { q: "Le gériatre est-il remboursé par la CNSS ou l'AMO ?", a: "Oui. Une consultation de gériatrie est une consultation médicale spécialisée : les assurés CNSS ou AMO bénéficient d'un remboursement partiel calculé sur la base du tarif national de référence (TNR), généralement autour de 80 % de ce tarif pour une consultation de base. Le reste à charge dépend de l'écart entre l'honoraire réel et le TNR." },
      { q: "Quelle différence entre un gériatre et un médecin généraliste ?", a: "Le médecin généraliste assure le suivi habituel et coordonne les soins. Le gériatre est spécialisé dans la complexité liée à l'âge : il évalue globalement la personne âgée (santé, mémoire, autonomie, traitements, nutrition) et réajuste la prise en charge pour éviter les hospitalisations et l'iatrogénie. Les deux se complètent." },
      { q: "Qu'est-ce que l'évaluation gériatrique globale ?", a: "C'est un bilan approfondi qui explore l'état médical, la mobilité, la mémoire, l'humeur, la nutrition, l'autonomie et les traitements de la personne âgée. Cette évaluation, plus longue qu'une consultation classique, permet d'établir un plan de soins personnalisé et de repérer les risques comme les chutes ou la dénutrition." },
      { q: "Comment prendre rendez-vous avec un gériatre au Maroc ?", a: "Sur SantéauMaroc, filtrez par spécialité « Gériatrie » et par ville pour trouver un praticien près de chez vous, comparez les profils et réservez en ligne gratuitement. Vous pouvez aussi demander à votre médecin traitant une orientation vers un service de gériatrie hospitalier." },
      { q: "Le gériatre peut-il intervenir à domicile pour une personne âgée dépendante ?", a: "Oui, certains gériatres et équipes de soins proposent des visites à domicile, particulièrement utiles pour les personnes âgées peu mobiles ou en perte d'autonomie. Cette consultation permet d'évaluer l'environnement réel de vie (risques de chute, adaptation du logement, aides humaines). Au Maroc, cette offre reste surtout développée dans le secteur privé des grandes villes ; renseignez-vous à la prise de rendez-vous sur la disponibilité de ce service." },
      { q: "Comment aider un proche âgé qui refuse de consulter un gériatre ?", a: "Le refus de soins est fréquent chez la personne âgée, souvent par crainte de perdre son autonomie ou par déni des troubles. Privilégiez une approche progressive : parlez d'un simple bilan de santé plutôt que d'une consultation spécialisée, et associez le médecin de famille en qui le proche a confiance. Impliquer la personne dans la décision, sans la brusquer, augmente nettement les chances d'acceptation." },
      { q: "Le gériatre s'occupe-t-il des troubles de la mémoire et de la maladie d'Alzheimer ?", a: "Oui, l'évaluation des troubles cognitifs fait partie du cœur de métier du gériatre, qui utilise des tests adaptés pour distinguer un vieillissement normal d'une maladie comme Alzheimer. Il coordonne le diagnostic avec le neurologue si besoin, propose un suivi et accompagne l'entourage. Une prise en charge précoce aide à mieux organiser le quotidien et à sécuriser le domicile." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Approche globale", label: "Polypathologie et autonomie" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les situations prises en charge par le gériatre",
        body: [
          "Le gériatre s'occupe des affections fréquentes chez la personne âgée : maladies chroniques associées (diabète, hypertension, insuffisance cardiaque ou rénale), troubles neurocognitifs comme la maladie d'Alzheimer, dépression du sujet âgé, ostéoporose et fragilité osseuse. Sa particularité est d'aborder ces problèmes ensemble plutôt qu'isolément.",
          "Les chutes constituent un motif majeur de consultation : elles peuvent révéler une baisse de la vue, un trouble de l'équilibre, un effet de médicament ou une faiblesse musculaire. Le gériatre recherche la cause, prévient la récidive et limite le risque de fracture, source fréquente de perte d'autonomie chez la personne âgée.",
        ],
      },
      {
        h: "Les examens et l'évaluation gériatrique",
        body: [
          "La consultation gériatrique repose d'abord sur des tests cliniques simples : évaluation de la mémoire, de la marche et de l'équilibre, de l'humeur, de l'état nutritionnel et de l'autonomie dans les gestes du quotidien. Ces échelles guident le diagnostic sans nécessiter systématiquement d'examens lourds.",
          "Selon les besoins, le gériatre peut demander un bilan sanguin, un bilan nutritionnel, une imagerie (scanner ou IRM cérébrale en cas de troubles de la mémoire) ou l'avis d'autres spécialistes. L'objectif reste toujours de proposer les examens réellement utiles, sans multiplier les investigations inconfortables pour une personne fragile.",
        ],
      },
      {
        h: "Prévention des chutes, de la dénutrition et de la perte d'autonomie",
        body: [
          "La prévention est au cœur de la gériatrie. Prévenir les chutes passe par l'adaptation du domicile, la révision des médicaments qui endorment ou font baisser la tension, la correction de la vue et le maintien d'une activité physique adaptée. Ces mesures simples réduisent nettement le risque de fracture.",
          "La dénutrition est fréquente et souvent sous-estimée chez la personne âgée : elle aggrave la fatigue, affaiblit les défenses et favorise les chutes. Le gériatre surveille le poids, adapte l'alimentation et intervient tôt pour préserver la force musculaire et l'autonomie le plus longtemps possible.",
        ],
      },
      {
        h: "L'ajustement des traitements et la lutte contre l'iatrogénie",
        body: [
          "Les personnes âgées cumulent souvent de nombreux médicaments prescrits par différents médecins. Cette polymédication augmente le risque d'interactions, de chutes, de confusion et d'hospitalisation : c'est l'iatrogénie. Le gériatre passe en revue l'ensemble des ordonnances pour arrêter ce qui est inutile ou dangereux.",
          "Il adapte aussi les doses au fonctionnement des reins et du foie, qui évolue avec l'âge. Cette révision régulière des traitements est l'un des apports les plus précieux de la gériatrie : elle améliore le confort de vie tout en réduisant les effets indésirables.",
        ],
      },
      {
        h: "Parcours de soins et remboursement au Maroc",
        body: [
          "Au Maroc, la gériatrie s'exerce dans les services hospitaliers publics, dans certaines cliniques privées et en consultation de ville. La personne âgée est le plus souvent orientée par son médecin traitant, mais une consultation directe reste possible. La coordination entre le gériatre, le médecin de famille et la famille est essentielle.",
          "Sur le plan financier, les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation, calculé sur le tarif national de référence. Les examens et bilans prescrits peuvent également être pris en charge partiellement. Il est conseillé de conserver toutes les feuilles de soins pour constituer le dossier de remboursement.",
        ],
      },
      {
        h: "Le gériatre au cœur de la famille et de l'accompagnement des aidants",
        body: [
          "Au Maroc, la personne âgée vit le plus souvent au sein de la famille, et ce sont un conjoint, des enfants ou des proches qui assurent au quotidien l'aide aux repas, à la toilette et à la prise des médicaments. Le gériatre reconnaît ce rôle central de l'aidant et l'intègre pleinement dans la prise en charge : il explique la maladie en termes clairs, forme aux bons gestes et aide à anticiper l'évolution afin d'éviter les situations de crise.",
          "L'accompagnement des aidants est essentiel car la charge peut devenir épuisante, tant physiquement que moralement, ce qu'on appelle l'épuisement de l'aidant. Le gériatre est attentif à ces signes, oriente vers des solutions de répit lorsqu'elles existent et coordonne les intervenants autour de la personne. En cas de situation médicale grave ou de détresse aiguë (chute avec malaise, confusion brutale, difficulté à respirer), il faut contacter sans attendre les urgences en appelant le 15 (SAMU).",
        ],
      },
    ],
    prix: {
      title: "Tarifs d'un gériatre au Maroc",
      intro: "Les honoraires sont libres dans le secteur privé. Voici des fourchettes indicatives pour la gériatrie et les actes les plus fréquents. Les tarifs varient selon la ville, le praticien et la durée de la consultation.",
      rows: [
        { label: "Consultation (grandes villes)", value: "300 – 600 MAD" },
        { label: "Consultation (autres villes)", value: "250 – 450 MAD" },
        { label: "Évaluation gériatrique globale", value: "500 – 900 MAD" },
        { label: "Consultation mémoire / troubles cognitifs", value: "400 – 700 MAD" },
        { label: "Consultation en secteur public hospitalier", value: "Tarifs réduits" },
      ],
      note: "Fourchettes indicatives 2026, à titre d'information et non contractuelles. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur la base du tarif national de référence (TNR).",
    },
  },

  "neurochirurgie": {
    synonyme: "neurochirurgien",
    reviewed: "2026-07-05",
    description:
      "La neurochirurgie est la spécialité chirurgicale qui prend en charge les maladies du système nerveux : cerveau, moelle épinière, nerfs périphériques et colonne vertébrale. Au Maroc, le neurochirurgien intervient le plus souvent sur orientation d'un neurologue, d'un médecin traitant ou après un passage aux urgences, pour des pathologies comme la hernie discale, le canal lombaire étroit, les tumeurs cérébrales ou les traumatismes crâniens. Il ne faut pas le confondre avec le neurologue, qui prend en charge les affections neurologiques par voie médicale sans opérer. Les neurochirurgiens exercent dans les CHU et hôpitaux publics des grandes villes (Casablanca, Rabat, Marrakech, Fès) ainsi qu'en cliniques privées. Dans le privé, les honoraires sont libres et varient selon la ville et la complexité de l'acte. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation et d'une prise en charge partielle des actes chirurgicaux dans le cadre du tarif national de référence. Sur SantéauMaroc, vous pouvez trouver un neurochirurgien près de chez vous et prendre rendez-vous en ligne gratuitement.",
    quandConsulter: [
      "Douleurs persistantes du dos ou du cou avec irradiation dans un bras ou une jambe, malgré un traitement médical bien conduit",
      "Sciatique ou hernie discale confirmée à l'IRM ne cédant pas au repos, aux médicaments et à la rééducation",
      "Troubles de la marche, faiblesse musculaire ou perte de sensibilité d'un membre d'apparition progressive",
      "Maux de tête inhabituels et tenaces, accompagnés de vomissements, de troubles visuels ou de convulsions",
      "Suite à un traumatisme crânien ou vertébral, ou après la découverte d'une tumeur du cerveau ou de la moelle à l'imagerie",
    ],
    faqs: [
      { q: "Quelle est la différence entre un neurochirurgien et un neurologue ?", a: "Le neurologue est un médecin qui diagnostique et traite les maladies du système nerveux par des moyens médicaux (médicaments, suivi), sans opérer. Le neurochirurgien est un chirurgien qui intervient au bloc opératoire sur le cerveau, la moelle, les nerfs ou la colonne. Les deux travaillent souvent ensemble : le neurologue oriente vers le neurochirurgien lorsqu'une opération est envisagée." },
      { q: "Combien coûte une consultation de neurochirurgie au Maroc ?", a: "Dans le privé, les honoraires sont libres. Une consultation coûte en général entre 400 et 700 MAD dans les grandes villes comme Casablanca, Rabat ou Marrakech, et entre 300 et 500 MAD dans les autres villes. Les tarifs des interventions chirurgicales varient fortement selon leur nature et l'établissement. Dans le secteur public, la consultation est bien moins onéreuse." },
      { q: "Comment prendre rendez-vous avec un neurochirurgien au Maroc ?", a: "Sur SantéauMaroc, filtrez l'annuaire par spécialité « Neurochirurgie » et par ville pour afficher les praticiens proches de chez vous. Vous pouvez consulter leur profil, leurs langues et leur adresse, puis réserver un rendez-vous en ligne gratuitement quand le praticien propose la réservation. Pensez à apporter vos IRM, scanners et le courrier de votre médecin le jour de la consultation." },
      { q: "Faut-il une orientation pour consulter un neurochirurgien ?", a: "Ce n'est pas obligatoire, mais c'est la voie la plus fréquente et la plus efficace. La plupart des patients arrivent avec une orientation d'un neurologue, d'un médecin généraliste ou après un passage aux urgences, accompagnée d'examens d'imagerie. Cela permet au neurochirurgien d'évaluer d'emblée l'indication opératoire et d'éviter des examens redondants." },
      { q: "La chirurgie de la hernie discale est-elle toujours nécessaire ?", a: "Non. La majorité des hernies discales s'améliorent avec un traitement médical, du repos relatif et de la kinésithérapie. La chirurgie est réservée aux cas où la douleur résiste au traitement, ou en présence de signes de gravité comme une paralysie ou des troubles urinaires. Le neurochirurgien évalue le rapport bénéfice/risque avec vous avant toute décision." },
      { q: "La neurochirurgie est-elle remboursée par la CNSS ou l'AMO ?", a: "Oui, partiellement. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation, calculé sur la base du tarif national de référence. Les interventions et hospitalisations font l'objet d'une prise en charge partielle qui peut nécessiter un accord préalable. Il est conseillé de vérifier les modalités auprès de votre organisme avant une opération programmée." },
      { q: "Quel est le délai de récupération après une opération neurochirurgicale ?", a: "Il dépend beaucoup de l'intervention et de l'état de santé initial. Après une chirurgie de hernie discale, la reprise des activités légères se fait souvent en quelques semaines, tandis qu'une chirurgie crânienne demande une convalescence plus longue et surveillée. Le neurochirurgien précise un calendrier personnalisé et prescrit fréquemment une rééducation. Un suivi régulier permet d'adapter la reprise du travail et des efforts." },
      { q: "La rééducation est-elle nécessaire après une chirurgie de la colonne ou du cerveau ?", a: "Oui, elle est souvent recommandée pour retrouver mobilité, force et autonomie. Selon les cas, elle associe kinésithérapie, ergothérapie ou rééducation neurologique, sous coordination du neurochirurgien et parfois d'un médecin de rééducation (MPR). Au Maroc, ces soins existent dans le public et le privé, avec une prise en charge partielle possible via la CNSS/AMO sur prescription. Commencer tôt améliore généralement les résultats." },
      { q: "Quels signaux après une opération doivent amener à consulter en urgence ?", a: "Après une intervention, une fièvre élevée, un écoulement ou une rougeur au niveau de la cicatrice, des maux de tête violents, des vomissements, une faiblesse d'un membre ou des troubles de la conscience imposent une consultation immédiate. Ces signes peuvent traduire une infection ou une complication. En cas de signe grave ou brutal, appelez le 15 (SAMU) sans attendre. Gardez toujours le contact de l'équipe qui vous a opéré." },
    ],
    essentiel: [
      { value: "400 – 700 MAD", label: "Consultation en grande ville" },
      { value: "Cerveau · moelle · colonne", label: "Chirurgie du système nerveux" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les principales pathologies traitées",
        body: [
          "Le neurochirurgien prend en charge un large éventail d'affections. Les plus fréquentes concernent la colonne vertébrale : hernie discale lombaire ou cervicale, canal lombaire étroit responsable de douleurs à la marche, et compressions de la moelle ou des racines nerveuses. Ces pathologies dégénératives sont fréquentes au Maroc, en particulier chez les adultes exerçant un travail physique.",
          "Le champ d'intervention s'étend aussi aux tumeurs du cerveau et de la moelle, aux traumatismes crâniens et vertébraux, à l'hydrocéphalie, ainsi qu'à certaines pathologies vasculaires comme les anévrismes. Le neurochirurgien décide, selon le bilan, entre surveillance, traitement médical en coordination avec le neurologue, ou intervention chirurgicale.",
        ],
      },
      {
        h: "Examens et actes courants",
        body: [
          "Le diagnostic en neurochirurgie repose largement sur l'imagerie. L'IRM est l'examen de référence pour visualiser le cerveau, la moelle et les disques intervertébraux ; le scanner (TDM) est privilégié en urgence, notamment après un traumatisme crânien. Des examens complémentaires comme l'électromyogramme ou l'artériographie peuvent être demandés selon la situation.",
          "Côté actes, le neurochirurgien pratique la cure de hernie discale, la laminectomie pour le canal étroit, l'exérèse de tumeurs, la pose de dérivation pour l'hydrocéphalie ou encore la chirurgie des nerfs périphériques comme le canal carpien. Beaucoup d'interventions bénéficient aujourd'hui de techniques mini-invasives et de la microchirurgie, disponibles dans les centres équipés des grandes villes.",
        ],
      },
      {
        h: "Prévention et prise en charge de la douleur du dos",
        body: [
          "La plupart des douleurs du dos et du cou ne relèvent pas de la chirurgie. La prévention passe par une bonne hygiène posturale, le renforcement musculaire, la gestion du poids et l'adaptation des gestes au travail. En cas de douleur, la première ligne de traitement associe antalgiques, repos relatif et kinésithérapie, souvent suffisante.",
          "Le recours au neurochirurgien intervient lorsque les symptômes persistent malgré ce traitement, ou en présence de signes d'alarme : déficit moteur, troubles sphinctériens, douleur nocturne intense. Consulter au bon moment permet d'éviter aussi bien la chirurgie inutile que le retard face à une compression nerveuse qui nécessite d'agir vite.",
        ],
      },
      {
        h: "Parcours de soins et remboursement",
        body: [
          "Le parcours débute généralement par le médecin traitant ou le neurologue, qui prescrit l'imagerie et oriente vers le neurochirurgien si une intervention est envisagée. En cas de traumatisme grave ou de symptômes brutaux, la prise en charge se fait par les urgences. Le patient a le choix entre le secteur public, où les tarifs sont bas mais les délais parfois longs, et le secteur privé.",
          "Les assurés CNSS ou AMO bénéficient d'un remboursement partiel de la consultation, sur la base du tarif national de référence, et d'une prise en charge partielle des actes chirurgicaux et de l'hospitalisation. Une demande d'accord préalable est souvent nécessaire pour les interventions programmées : il est prudent de constituer le dossier avec l'établissement en amont.",
        ],
      },
      {
        h: "Urgences et cas particuliers",
        body: [
          "Certaines situations exigent une prise en charge immédiate. Un traumatisme crânien avec perte de connaissance, vomissements ou confusion, une paralysie brutale d'un membre, une perte de contrôle des urines ou des selles associée à un mal de dos, ou un violent mal de tête inhabituel doivent conduire aux urgences sans délai. En cas de détresse, appelez le 15 (SAMU).",
          "Chez l'enfant, la neurochirurgie prend en charge des pathologies spécifiques comme l'hydrocéphalie ou certaines malformations, dans des centres spécialisés. Chez la personne âgée, le canal lombaire étroit et les hématomes après une chute sont fréquents. Dans tous les cas, la décision opératoire tient compte de l'état général et des attentes du patient.",
        ],
      },
      {
        h: "Choisir entre secteur public et privé pour une intervention",
        body: [
          "Au Maroc, la neurochirurgie est pratiquée dans les grands hôpitaux publics et CHU (Casablanca, Rabat, Fès, Marrakech notamment), ainsi que dans des cliniques privées. Le secteur public offre un plateau technique complet pour les cas lourds et un coût nettement plus faible, mais les délais d'intervention programmée peuvent être plus longs. Le privé permet souvent des délais plus courts, au prix d'honoraires libres qui varient fortement selon l'acte et l'établissement.",
          "Le choix dépend de l'urgence, de la nature de la pathologie et de votre couverture. Avant une intervention programmée, demandez un devis détaillé au privé et vérifiez auprès de la CNSS ou de l'AMO les modalités de prise en charge et d'accord préalable. Pour les cas urgents ou complexes, l'orientation vers un CHU reste souvent la voie la plus adaptée. SantéauMaroc vous aide à identifier les neurochirurgiens et établissements près de chez vous.",
        ],
      },
    ],
    prix: {
      title: "Tarifs indicatifs en neurochirurgie au Maroc",
      intro: "Dans le secteur privé, les honoraires sont libres et dépendent de la ville, de l'expérience du praticien et de la complexité de l'acte. Voici des fourchettes indicatives pour vous aider à anticiper le budget.",
      rows: [
        { label: "Consultation (grandes villes : Casa, Rabat, Marrakech)", value: "400 – 700 MAD" },
        { label: "Consultation (autres villes)", value: "300 – 500 MAD" },
        { label: "IRM cérébrale ou du rachis (imagerie)", value: "1 500 – 3 500 MAD" },
        { label: "Cure de hernie discale (privé, selon technique)", value: "20 000 – 45 000 MAD" },
        { label: "Chirurgie de tumeur ou du canal lombaire (privé)", value: "à partir de 30 000 MAD" },
      ],
      note: "Tarifs indicatifs 2026, à titre d'orientation et non contractuels. Les prix réels varient selon le praticien et l'établissement. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel, sur la base du tarif national de référence ; une demande d'accord préalable est souvent requise pour les interventions programmées.",
    },
  },

  "medecine-generale": {
    synonyme: "médecin généraliste",
    synonymePluriel: "médecins généralistes",
    reviewed: "2026-07-04",
    description:
      "Le médecin généraliste — aussi appelé médecin de famille ou omnipraticien — est le premier interlocuteur de votre parcours de soins au Maroc. Accessible sans orientation préalable, il diagnostique et traite la grande majorité des affections courantes (infections, fièvre, douleurs, troubles digestifs) et assure le suivi des maladies chroniques comme le diabète, l'hypertension artérielle ou l'asthme. Véritable pivot du système de santé, il coordonne votre prise en charge, tient à jour votre dossier médical et vous oriente vers le bon spécialiste lorsque c'est nécessaire. La médecine générale couvre aussi la prévention (vaccinations, bilans de santé, dépistage), la délivrance de certificats médicaux et le renouvellement d'ordonnances. Consulter régulièrement un généraliste permet de détecter précocement les pathologies et d'éviter des complications plus lourdes.",
    quandConsulter: [
      "Fièvre persistante, grippe, angine ou infection ORL",
      "Douleurs abdominales, maux de tête ou douleurs musculaires",
      "Fatigue inhabituelle, troubles du sommeil ou anxiété légère",
      "Suivi de maladies chroniques : diabète, hypertension, asthme",
      "Renouvellement d'ordonnance et ajustement de traitement",
      "Vaccination, bilan de santé annuel ou dépistage",
      "Certificat médical (sport, travail, scolarité, aptitude)",
      "Interprétation de résultats d'analyses ou d'imagerie",
    ],
    faqs: [
      {
        q: "Quel est le rôle du médecin généraliste ?",
        a: "Le médecin généraliste est le médecin de premier recours : il prend en charge la grande majorité des motifs de consultation courants (infections, douleurs, fièvre, fatigue), assure le suivi des maladies chroniques, gère la prévention et les vaccinations, et coordonne l'ensemble de votre parcours de soins. Il vous oriente vers le spécialiste adapté uniquement lorsque votre état le justifie.",
      },
      {
        q: "Quelle est la différence entre un médecin généraliste et un médecin de famille ?",
        a: "Il s'agit de la même spécialité : « médecin de famille » désigne la pratique de la médecine générale centrée sur le suivi durable d'un patient et de son entourage, à l'aide d'un dossier médical tenu dans le temps. Au Maroc, les termes médecin généraliste, médecin de famille et omnipraticien sont employés indifféremment.",
      },
      {
        q: "Combien coûte une consultation en médecine générale au Maroc ?",
        a: "Les honoraires sont libres dans le secteur privé : comptez généralement 150 à 300 MAD dans les grandes villes (Casablanca, Rabat, Marrakech) et à partir de 100 MAD dans les villes moyennes et les zones rurales. Une visite à domicile ou une consultation de nuit/dimanche entraîne une majoration. Les assurés CNSS ou AMO sont remboursés sur la base du tarif national de référence (TNR).",
      },
      {
        q: "Comment est remboursée une consultation chez le généraliste (CNSS, AMO) ?",
        a: "L'AMO gérée par la CNSS rembourse la consultation de médecine générale à hauteur d'environ 80 % du tarif national de référence (TNR), un ticket modérateur de 20 % restant à votre charge. Par exemple, sur une base TNR de 150 MAD, environ 120 MAD sont remboursés. Il faut déposer une feuille de soins remplie et cachetée par le médecin (déclaration possible en ligne sur cnss.ma), dans un délai de 6 mois. Une mutuelle complémentaire peut couvrir le reste à charge.",
      },
      {
        q: "Faut-il une ordonnance ou une orientation pour consulter un généraliste ?",
        a: "Non. Le médecin généraliste est accessible en accès direct, sans ordonnance ni orientation préalable d'un autre professionnel de santé. Il peut être votre premier contact pour un problème courant, y compris une urgence non vitale.",
      },
      {
        q: "Un médecin généraliste peut-il délivrer un certificat médical ?",
        a: "Oui. Le médecin généraliste établit la plupart des certificats médicaux courants : certificat d'aptitude au sport, certificat de non-contre-indication, arrêt de travail, absence scolaire ou certificat d'aptitude professionnelle. Le certificat n'est délivré qu'après un examen clinique le justifiant.",
      },
      {
        q: "Comment trouver un médecin généraliste de garde ou le dimanche au Maroc ?",
        a: "Pour un besoin le soir, le week-end ou un jour férié, vous pouvez consulter un médecin de garde, une permanence de soins ou un service d'urgences. Sur SantéauMaroc, filtrez par disponibilité pour repérer les praticiens ouverts aujourd'hui. En cas d'urgence vitale, appelez le 15 (SAMU) ou le 150.",
      },
      {
        q: "Peut-on consulter un généraliste à domicile ou en téléconsultation ?",
        a: "Oui. Certains médecins généralistes proposent la visite à domicile (utile pour les personnes âgées ou à mobilité réduite) ainsi que la téléconsultation, adaptée à un avis médical, un renouvellement d'ordonnance ou l'interprétation de résultats. La téléconsultation ne remplace pas un examen clinique lorsqu'il est nécessaire.",
      },
      {
        q: "Comment prendre rendez-vous avec un médecin généraliste au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par la spécialité « Médecine générale » et votre ville, comparez les profils vérifiés, les avis patients, les langues parlées et le conventionnement, puis réservez en ligne gratuitement — sans frais d'inscription et avec confirmation du créneau.",
      },
    ],
    essentiel: [
      { value: "100 – 300 MAD", label: "Tarif de consultation" },
      { value: "≈ 80 % du TNR", label: "Remboursement CNSS / AMO" },
      { value: "Accès direct", label: "1er recours, sans orientation" },
    ],
    sections: [
      {
        h: "Médecin généraliste ou spécialiste : qui consulter en premier ?",
        body: [
          "Au Maroc, le médecin généraliste est votre point d'entrée naturel dans le système de soins. Il prend en charge la grande majorité des motifs de consultation — fièvre, infections, douleurs, fatigue, troubles digestifs — sans qu'aucune orientation préalable ne soit nécessaire.",
          "Le recours direct à un spécialiste (cardiologue, dermatologue, gynécologue…) reste possible, mais il est souvent plus efficace de consulter d'abord un généraliste : il pose un premier diagnostic, prescrit les examens utiles et vous oriente vers le bon spécialiste si votre état le justifie. Cette coordination évite des consultations inutiles et accélère votre prise en charge.",
        ],
      },
      {
        h: "Médecine générale ou médecine de famille : quelle différence ?",
        body: [
          "Les deux appellations recouvrent la même spécialité. « Médecine de famille » insiste sur la relation de suivi dans la durée : le même médecin connaît vos antécédents, ceux de votre famille et tient à jour un dossier médical qui sert de mémoire de votre santé. Écoute, disponibilité et conseils personnalisés en sont les maîtres-mots.",
          "Au Maroc, les termes médecin généraliste, médecin de famille et omnipraticien sont utilisés indifféremment. L'essentiel n'est pas l'étiquette, mais la continuité : consulter régulièrement le même praticien améliore la qualité du suivi et la maîtrise des dépenses de santé.",
        ],
      },
      {
        h: "Comment se déroule une consultation de médecine générale ?",
        body: [
          "La consultation débute par un interrogatoire (motif, symptômes, antécédents, traitements en cours), suivi d'un examen clinique. Le médecin peut ensuite prescrire des analyses, une imagerie ou un traitement, rédiger une ordonnance, délivrer un certificat ou vous orienter vers un spécialiste.",
          "Pour gagner du temps, apportez votre carte d'identité, votre carte d'assurance (CNSS/AMO ou mutuelle), vos ordonnances et traitements en cours, votre carnet de vaccination ainsi que vos derniers résultats d'analyses ou de radios. Notez à l'avance vos questions et la chronologie de vos symptômes.",
        ],
      },
      {
        h: "Remboursement d'une consultation : CNSS, AMO et mutuelles",
        body: [
          "Les assurés de l'AMO (gérée par la CNSS) sont remboursés sur la base du tarif national de référence (TNR) fixé par l'ANAM, généralement à hauteur de 80 %, un ticket modérateur de 20 % restant à leur charge. Le remboursement s'appuie sur le tarif de référence, souvent inférieur à l'honoraire réellement pratiqué dans le privé.",
          "Pour être remboursé, déposez une feuille de soins dûment remplie, signée et cachetée par le médecin, accompagnée de l'ordonnance et des justificatifs. La CNSS permet désormais la télédéclaration en ligne, avec des délais réduits. Le dossier doit être déposé dans les 6 mois suivant la consultation ; une mutuelle complémentaire peut couvrir le reste à charge.",
        ],
      },
      {
        h: "Médecin généraliste, médecin de garde ou urgences : comment choisir ?",
        body: [
          "Pour un problème de santé courant et non vital — fièvre, angine, renouvellement d'ordonnance, certificat médical, douleur modérée — le médecin généraliste est l'interlocuteur adapté, y compris en première intention. Le soir, le week-end ou un jour férié, orientez-vous vers un médecin de garde ou une permanence de soins.",
          "En revanche, certains signes imposent un recours immédiat aux urgences ou au 15 (SAMU) : douleur thoracique intense, difficulté à respirer, perte de connaissance, paralysie ou trouble brutal de la parole, saignement abondant, ou tout pronostic vital engagé. En cas de doute sur la gravité, n'attendez pas : contactez les secours.",
        ],
      },
      {
        h: "La téléconsultation avec un médecin généraliste au Maroc",
        body: [
          "La téléconsultation se développe rapidement au Maroc et permet d'échanger à distance avec un médecin généraliste pour un avis médical, un renouvellement d'ordonnance ou l'interprétation de résultats d'analyses.",
          "Elle ne remplace pas un examen clinique lorsqu'il est nécessaire, mais elle fait gagner du temps pour les situations simples et facilite l'accès aux soins dans les zones où l'offre médicale est limitée.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un médecin généraliste ?",
      intro:
        "Les honoraires sont libres dans le secteur privé au Maroc et varient selon la ville, le secteur (public ou privé) et le type de consultation. Voici des fourchettes indicatives constatées en 2026.",
      rows: [
        { label: "Grandes villes (Casablanca, Rabat, Marrakech)", value: "150 – 300 MAD" },
        { label: "Villes moyennes (Fès, Tanger, Agadir, Meknès)", value: "120 – 200 MAD" },
        { label: "Autres villes et zones rurales", value: "100 – 150 MAD" },
        { label: "Visite à domicile", value: "300 – 600 MAD" },
        { label: "Nuit, dimanche ou jour férié", value: "Majoration de 30 – 50 %" },
        { label: "Téléconsultation", value: "100 – 200 MAD" },
      ],
      note: "Tarifs indicatifs (2026), honoraires libres dans le secteur privé. La CNSS/AMO rembourse sur la base du tarif national de référence (TNR), généralement à 80 % (ticket modérateur de 20 % à votre charge). Exemple : sur une base TNR de 150 MAD, environ 120 MAD sont remboursés.",
    },
  },

  "cardiologie": {
    synonyme: "cardiologue",
    reviewed: "2026-07-05",
    description:
      "Le cardiologue est le médecin spécialiste du cœur et des vaisseaux sanguins. Il diagnostique et traite les maladies cardiovasculaires : insuffisance cardiaque, troubles du rythme, hypertension artérielle, coronaropathie et maladies vasculaires périphériques. Au Maroc, les pathologies cardiovasculaires représentent la première cause de mortalité, ce qui rend la consultation cardiologique essentielle dès l'apparition de symptômes évocateurs. Le cardiologue réalise des examens spécialisés — ECG, échocardiographie, épreuve d'effort, Holter — pour poser un diagnostic précis et proposer un traitement médicamenteux ou interventionnel adapté.",
    quandConsulter: [
      "Douleur thoracique ou oppression dans la poitrine",
      "Palpitations ou rythme cardiaque irrégulier",
      "Essoufflement à l'effort ou au repos",
      "Hypertension artérielle à surveiller",
      "Antécédents familiaux de maladies cardiovasculaires",
    ],
    faqs: [
      {
        q: "Quels examens réalise un cardiologue ?",
        a: "Le cardiologue effectue un ECG, une échocardiographie (échographie cardiaque), une épreuve d'effort, un Holter ECG sur 24 h, et peut prescrire un scanner coronarien ou une coronarographie selon les cas cliniques.",
      },
      {
        q: "Combien coûte une consultation chez un cardiologue au Maroc ?",
        a: "Le tarif d'une consultation cardiologique varie entre 300 et 600 MAD au Maroc selon la ville et les examens inclus. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "Faut-il une référence pour consulter un cardiologue ?",
        a: "Une ordonnance du médecin généraliste n'est pas obligatoire mais recommandée pour orienter la consultation. Certaines mutuelles exigent un parcours coordonné pour le remboursement.",
      },
      {
        q: "Comment prendre rendez-vous avec un cardiologue au Maroc ?",
        a: "SantéauMaroc vous permet de trouver un cardiologue disponible dans votre ville, de consulter ses avis patients vérifiés et de prendre rendez-vous en ligne gratuitement, sans délai d'attente supplémentaire.",
      },
      { q: "Quand faut-il consulter un cardiologue plutôt que son médecin généraliste ?", a: "Le médecin généraliste reste votre premier interlocuteur et peut assurer un suivi de base de la tension ou du cholestérol. Une consultation cardiologique s'impose en cas de symptômes évocateurs (douleur thoracique, palpitations, essoufflement anormal, malaises), d'antécédents familiaux de maladie cardiaque précoce, ou pour un bilan avant une activité sportive intense. En cas de douleur thoracique intense et prolongée, n'attendez pas : appelez le 15 (SAMU)." },
      { q: "Le cardiologue et le suivi de la grossesse : est-ce nécessaire ?", a: "Oui dans certaines situations. Une femme enceinte présentant une hypertension, une cardiopathie connue, un souffle au cœur ou des palpitations est souvent orientée vers un cardiologue en coordination avec le gynécologue. Le cœur travaille davantage pendant la grossesse, ce qui peut révéler ou aggraver un problème préexistant. Un suivi conjoint permet d'adapter le traitement et de sécuriser l'accouchement." },
      { q: "Comment se préparer à une première consultation chez le cardiologue ?", a: "Apportez vos ordonnances en cours, vos derniers résultats d'analyses (bilan lipidique, glycémie) et tout examen antérieur (ECG, échographie, comptes rendus d'hospitalisation). Notez vos symptômes, leur fréquence et les situations qui les déclenchent. Préparez aussi les antécédents cardiaques de votre famille. Ces informations aident le cardiologue à cibler son diagnostic dès la première visite." },
      { q: "L'AMO et la CNSS remboursent-elles les examens cardiologiques au Maroc ?", a: "Les examens comme l'ECG, l'échocardiographie ou l'épreuve d'effort sont en principe pris en charge par l'AMO (CNSS pour les salariés, régime des indépendants) sur la base des tarifs de référence de l'ANAM. Le remboursement se fait après entente préalable dans certains cas et sur présentation d'une prescription. Comme les honoraires du privé sont libres, un reste à charge est fréquent : demandez le devis et une facture conforme pour votre dossier de remboursement." },
      { q: "Quels changements de mode de vie un cardiologue recommande-t-il en priorité ?", a: "Les mesures les plus efficaces sont l'arrêt du tabac, la réduction du sel et des graisses saturées, une activité physique régulière adaptée à votre état, et le maintien d'un poids sain. Le cardiologue insiste souvent sur la gestion du stress et un sommeil suffisant. Ces habitudes, associées au traitement prescrit, réduisent nettement le risque d'accident cardiaque et sont recommandées à tout âge." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "ECG · écho", label: "Examens réalisés au cabinet" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Pourquoi le suivi cardiologique est essentiel au Maroc",
        body: [
          "Les maladies cardiovasculaires sont la première cause de mortalité au Maroc, favorisées par l'hypertension, le diabète, le tabac et le surpoids. Beaucoup évoluent silencieusement avant de se révéler par un accident grave.",
          "Un suivi régulier chez le cardiologue, surtout après 40 ans ou en cas de facteurs de risque, permet de dépister tôt et de prévenir l'infarctus et l'AVC. C'est l'un des suivis les plus rentables en termes de santé.",
        ],
      },
      {
        h: "Les examens du cardiologue : ECG, échocardiographie, épreuve d'effort",
        body: [
          "Le cardiologue dispose d'examens non invasifs pour explorer le cœur : l'électrocardiogramme (ECG) enregistre l'activité électrique, l'échocardiographie visualise le muscle et les valves, l'épreuve d'effort teste le cœur à l'effort.",
          "Le Holter enregistre le rythme sur 24 heures pour traquer les troubles intermittents. Ces examens, souvent réalisés au cabinet, orientent un diagnostic précis et le traitement adapté.",
        ],
      },
      {
        h: "Hypertension artérielle : la maladie silencieuse",
        body: [
          "L'hypertension ne provoque souvent aucun symptôme, mais elle use le cœur, les artères, les reins et le cerveau. Très fréquente au Maroc, elle reste sous-diagnostiquée et insuffisamment traitée.",
          "Un dépistage simple (mesure de la tension) et un suivi régulier permettent de la contrôler par l'hygiène de vie et, si besoin, un traitement. Bien équilibrée, elle réduit fortement le risque d'AVC et d'infarctus.",
        ],
      },
      {
        h: "Reconnaître une urgence cardiaque",
        body: [
          "Une douleur intense dans la poitrine, serrant comme un étau et irradiant vers le bras ou la mâchoire, surtout avec essoufflement ou sueurs, peut signaler un infarctus. Chaque minute compte.",
          "Dans ce cas, n'attendez pas : appelez les secours (SAMU 15) immédiatement. Une prise en charge rapide sauve le muscle cardiaque et la vie.",
        ],
      },
      {
        h: "Facteurs de risque cardiovasculaire : agir tôt au Maroc",
        body: [
          "Plusieurs facteurs augmentent le risque de maladie cardiaque et se rencontrent fréquemment au Maroc : tabagisme, diabète, excès de cholestérol, surpoids, sédentarité et antécédents familiaux. La transition alimentaire, avec une consommation accrue de sel, de sucre et de produits transformés, contribue à cette évolution, tandis que le diabète et l'hypertension restent des motifs de consultation très courants. Repérer ces facteurs le plus tôt possible permet d'agir avant l'apparition de complications.",
          "Le rôle du cardiologue ne se limite pas à traiter une maladie déclarée : il évalue votre risque global et propose une stratégie de prévention personnalisée. Cela passe par un bilan (tension, bilan lipidique, glycémie, parfois ECG), des conseils d'hygiène de vie et, si nécessaire, un traitement. Un suivi régulier, même en l'absence de symptômes, est particulièrement utile après 40 ans ou en présence de plusieurs facteurs de risque cumulés.",
        ],
      },
      {
        h: "Vivre avec une maladie cardiaque : suivi et observance",
        body: [
          "Un diagnostic cardiaque n'empêche pas de mener une vie active, à condition d'un suivi régulier et d'une bonne observance du traitement. Les rendez-vous de contrôle permettent d'ajuster les médicaments, de surveiller la tension et de refaire les examens nécessaires (échocardiographie, bilan sanguin). Interrompre un traitement sans avis médical, même quand on se sent bien, expose à des rechutes et à des complications graves. Conservez une liste à jour de vos médicaments et signalez tout effet indésirable.",
          "L'éducation du patient est un pilier du suivi cardiologique. Apprendre à reconnaître les signes d'alerte, à mesurer sa tension à domicile et à adapter son activité physique améliore nettement le pronostic. En cas d'aggravation soudaine, d'essoufflement au repos, de douleur thoracique prolongée ou de malaise, il ne faut pas attendre le prochain rendez-vous : contactez le 15 (SAMU) ou rendez-vous aux urgences. Un dialogue continu avec votre cardiologue reste la meilleure garantie d'un cœur bien pris en charge.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un cardiologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Électrocardiogramme (ECG)", value: "100 – 250 MAD" },
        { label: "Échocardiographie (écho cœur)", value: "400 – 900 MAD" },
        { label: "Épreuve d'effort", value: "500 – 1 200 MAD" },
        { label: "Holter ECG (24 h)", value: "400 – 900 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "pediatrie": {
    synonyme: "pédiatre",
    reviewed: "2026-07-05",
    description:
      "Le pédiatre est le médecin spécialiste des enfants, de la naissance à l'adolescence. Il suit la croissance, le développement psychomoteur et la santé globale de l'enfant, prend en charge les maladies infantiles courantes et pratique les vaccinations selon le calendrier vaccinal marocain. La pédiatrie couvre également les affections chroniques comme l'asthme, le diabète de type 1, les allergies alimentaires et les troubles du comportement. Consulter régulièrement un pédiatre permet de surveiller le bon développement de votre enfant et de dépister précocement d'éventuelles anomalies.",
    quandConsulter: [
      "Fièvre, toux ou difficultés respiratoires chez l'enfant",
      "Suivi de croissance et développement psychomoteur",
      "Vaccinations selon le calendrier national marocain",
      "Éruptions cutanées, allergies ou troubles digestifs",
      "Troubles du comportement ou de l'apprentissage",
    ],
    faqs: [
      {
        q: "À quel âge un enfant peut-il consulter un pédiatre ?",
        a: "Le pédiatre suit les enfants dès la naissance jusqu'à 16-18 ans. Les premières consultations sont recommandées dans les jours suivant la naissance pour vérifier l'état de santé du nouveau-né.",
      },
      {
        q: "Quelle différence entre pédiatre et médecin généraliste pour les enfants ?",
        a: "Le pédiatre est spécifiquement formé aux pathologies de l'enfant et au développement pédiatrique. Il est préférable pour les cas complexes, les nourrissons et le suivi des maladies chroniques infantiles.",
      },
      {
        q: "Combien coûte une consultation pédiatrique au Maroc ?",
        a: "Une consultation chez un pédiatre coûte généralement entre 200 et 400 MAD au Maroc selon la ville et le praticien. La CNSS et l'AMO remboursent une partie des frais.",
      },
      {
        q: "Comment trouver un pédiatre près de chez moi ?",
        a: "Utilisez la recherche SantéauMaroc pour filtrer les pédiatres par ville, consulter leurs avis patients vérifiés et prendre rendez-vous en ligne gratuitement.",
      },
      { q: "Faut-il apporter le carnet de santé à chaque consultation pédiatrique ?", a: "Oui, le carnet de santé est indispensable à chaque visite. Il permet au pédiatre de suivre la courbe de croissance, de vérifier les vaccins déjà reçus et de noter les nouveaux actes. En cas d'urgence ou de changement de médecin, ce document centralise l'historique médical de votre enfant." },
      { q: "Le pédiatre au Maroc est-il remboursé par la CNSS ou l'AMO ?", a: "Les consultations chez un pédiatre conventionné peuvent donner lieu à un remboursement partiel par la CNSS ou l'AMO, sur la base du Tarif National de Référence (TNR) de l'ANAM. Le montant remboursé dépend de votre régime et du secteur du praticien ; conservez la feuille de soins pour votre dossier. Dans le secteur public, la prise en charge suit les règles des établissements de santé." },
      { q: "Mon enfant a un trouble du sommeil ou de l'alimentation : le pédiatre peut-il aider ?", a: "Oui, le pédiatre évalue couramment les difficultés de sommeil, d'appétit ou d'introduction des aliments. Il recherche d'éventuelles causes médicales et propose des conseils adaptés à l'âge. Si nécessaire, il oriente vers un spécialiste comme un nutritionniste ou un pédopsychiatre." },
      { q: "À quel moment un pédiatre oriente-t-il vers un pédiatre spécialisé ?", a: "Le pédiatre généraliste assure le suivi courant, mais il oriente vers un surspécialiste (cardiologue pédiatrique, neuropédiatre, endocrinologue pédiatrique…) lorsqu'un problème précis le justifie. Cette orientation garantit une prise en charge experte tout en conservant un suivi global. Ces surspécialités sont surtout disponibles dans les grandes villes et les CHU." },
      { q: "Comment se passe le suivi d'un prématuré ou d'un nouveau-né fragile au Maroc ?", a: "Après la sortie de maternité ou de néonatologie, le suivi rapproché d'un prématuré est assuré par un pédiatre, parfois en lien avec le service hospitalier. Les visites sont plus fréquentes pour surveiller le poids, le développement et le rattrapage de croissance. En cas de difficulté respiratoire ou de refus alimentaire marqué, contactez sans délai les urgences ou le SAMU (15)." },
    ],
    essentiel: [
      { value: "200 – 400 MAD", label: "Tarif d'une consultation" },
      { value: "0 – 16 ans", label: "Suivi de l'enfant" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Le suivi régulier de l'enfant : croissance et vaccinations",
        body: [
          "Le pédiatre suit la croissance (poids, taille, périmètre crânien) et le développement psychomoteur de l'enfant à des âges clés, et met à jour les vaccinations selon le calendrier national marocain.",
          "Ces consultations de suivi, même chez un enfant en bonne santé, permettent de dépister précocement un trouble de la croissance, de la vue, de l'audition ou du développement, et de rassurer les parents.",
        ],
      },
      {
        h: "Pédiatre ou médecin généraliste : qui consulter pour son enfant ?",
        body: [
          "Le médecin généraliste prend en charge de nombreux motifs courants de l'enfant. Le pédiatre, spécialiste de l'enfant, est particulièrement indiqué pour les nourrissons, les cas complexes et le suivi des maladies chroniques infantiles.",
          "Beaucoup de familles consultent un pédiatre pour les premières années, puis alternent selon les besoins. L'essentiel est d'assurer un suivi régulier et les vaccinations à jour.",
        ],
      },
      {
        h: "Fièvre et infections de l'enfant : quand s'inquiéter ?",
        body: [
          "La fièvre est très fréquente et le plus souvent bénigne chez l'enfant. Certains signes imposent toutefois une consultation rapide : fièvre chez le nourrisson de moins de 3 mois, difficulté à respirer, somnolence inhabituelle, refus de boire ou éruption qui ne s'efface pas à la pression.",
          "Le pédiatre distingue les infections virales courantes, qui guérissent seules, des situations nécessitant un traitement, et explique aux parents les signes d'alerte à surveiller.",
        ],
      },
      {
        h: "Vaccinations selon le calendrier marocain",
        body: [
          "Le Maroc dispose d'un programme national de vaccination qui protège l'enfant contre de nombreuses maladies graves dès les premiers mois de vie. Le respect du calendrier est essentiel à l'immunité collective.",
          "Le pédiatre administre les vaccins, tient à jour le carnet de santé et conseille les parents sur les rappels et les vaccins complémentaires éventuels.",
        ],
      },
      {
        h: "Prématurité et nouveau-né : un suivi pédiatrique rapproché",
        body: [
          "Les premières semaines de vie sont déterminantes, en particulier pour un enfant né avant terme ou de petit poids. Le pédiatre organise un suivi rapproché après la sortie de la maternité ou du service de néonatologie : pesée régulière, surveillance de la courbe de croissance, contrôle du tonus et du développement, et vérification de la bonne prise alimentaire. Ce calendrier de visites, plus soutenu que pour un nourrisson né à terme, permet de repérer tôt un éventuel retard de croissance ou une difficulté d'alimentation.",
          "Au Maroc, ce suivi s'articule souvent entre le pédiatre de ville et le service hospitalier de rattachement, notamment dans les grandes villes disposant d'une unité de néonatologie. Les parents jouent un rôle central : ils décrivent le sommeil, les régurgitations, le nombre de couches et l'éveil de l'enfant. Certains signes imposent une réaction immédiate, comme une gêne respiratoire, un teint gris ou bleuté, une fièvre chez un très jeune nourrisson ou un refus total de boire ; dans ces situations, il faut contacter sans attendre les urgences ou le SAMU (15).",
        ],
      },
      {
        h: "Comprendre la courbe de croissance et le développement de l'enfant",
        body: [
          "À chaque consultation, le pédiatre reporte le poids, la taille et le périmètre crânien sur les courbes du carnet de santé. Ce qui compte n'est pas un chiffre isolé mais la régularité de la progression : un enfant qui suit harmonieusement son couloir de croissance est généralement rassurant, tandis qu'une cassure de courbe ou une accélération inhabituelle mérite d'être explorée. Ce suivi permet aussi de dépister précocement des situations comme un surpoids débutant ou une croissance insuffisante, fréquentes motifs de consultation au Maroc.",
          "Au-delà des mesures, le pédiatre évalue le développement psychomoteur : tenue de la tête, position assise, marche, premiers mots, interactions et langage. Ces repères varient d'un enfant à l'autre, et un léger décalage n'est pas toujours inquiétant. Le rôle du pédiatre est de distinguer les variations normales des signes justifiant un bilan complémentaire ou une orientation vers un spécialiste, tout en informant les parents sur les stimulations adaptées à l'âge de leur enfant.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation pédiatrique au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres et varient selon la ville et le praticien. Fourchettes indicatives.",
      rows: [
        { label: "Consultation de suivi", value: "200 – 400 MAD" },
        { label: "Consultation du nouveau-né", value: "250 – 450 MAD" },
        { label: "Vaccination (acte)", value: "100 – 250 MAD" },
        { label: "Consultation en clinique privée", value: "300 – 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les vaccins du programme national sont gratuits dans les centres de santé publics. Les assurés CNSS et AMO bénéficient d'un remboursement partiel.",
    },
  },

  "gyneco-obstetrique": {
    synonyme: "gynécologue",
    reviewed: "2026-07-05",
    description:
      "Le gynécologue est le spécialiste de la santé de la femme, couvrant la santé reproductive, la grossesse, l'accouchement et les pathologies de l'appareil génital féminin. Au Maroc, le suivi gynécologique régulier est essentiel pour le dépistage du cancer du col de l'utérus et du sein. Le gynécologue-obstétricien prend également en charge les grossesses à risque et pratique les accouchements. La consultation annuelle est recommandée dès le début de la vie sexuelle active, indépendamment de tout symptôme.",
    quandConsulter: [
      "Suivi gynécologique annuel et frottis cervical",
      "Grossesse et suivi prénatal",
      "Troubles du cycle menstruel",
      "Douleurs pelviennes inexpliquées",
      "Contraception et planification familiale",
    ],
    faqs: [
      {
        q: "À partir de quel âge consulter un gynécologue ?",
        a: "La première consultation gynécologique est recommandée dès le début de la vie sexuelle active ou vers 18-20 ans, même en l'absence de symptômes, pour un bilan de base et la réalisation d'un frottis cervical.",
      },
      {
        q: "Combien coûte une consultation gynécologique au Maroc ?",
        a: "Une consultation chez un gynécologue au Maroc coûte entre 250 et 500 MAD selon le praticien et les examens réalisés. La CNSS et l'AMO prennent en charge une partie des frais.",
      },
      {
        q: "Quelle est la différence entre gynécologue et obstétricien ?",
        a: "Le gynécologue s'occupe de la santé de la femme en général, tandis que l'obstétricien se spécialise dans le suivi de grossesse et les accouchements. La plupart des praticiens au Maroc cumulent les deux spécialités.",
      },
      {
        q: "Comment prendre rendez-vous avec un gynécologue ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Gynécologie » et votre ville pour trouver un gynécologue disponible et réserver en ligne gratuitement.",
      },
      { q: "Faut-il un gynécologue ou une sage-femme pour un accouchement au Maroc ?", a: "Les deux interviennent selon le contexte. Dans le secteur public et les maisons d'accouchement, les sages-femmes assurent la majorité des accouchements normaux, avec un gynécologue-obstétricien disponible en cas de complication. En clinique privée, l'accouchement est le plus souvent suivi directement par le gynécologue. Pour une grossesse à risque (diabète, hypertension, jumeaux), un suivi obstétrical spécialisé est recommandé." },
      { q: "La consultation gynécologique et l'accouchement sont-ils remboursés par la CNSS ou l'AMO ?", a: "L'AMO (via CNSS pour les salariés) rembourse une partie des consultations et actes selon la Tarification Nationale de Référence (TNR) fixée par l'ANAM. En secteur privé, les honoraires étant libres, un reste à charge subsiste souvent. L'accouchement, le suivi prénatal et certains examens sont pris en charge partiellement. Demandez toujours une facture et une feuille de soins pour constituer votre dossier de remboursement." },
      { q: "Que faire en cas de saignements ou de fortes douleurs pendant la grossesse ?", a: "Des saignements abondants, des douleurs abdominales intenses, une fièvre ou une diminution des mouvements du bébé nécessitent un avis médical urgent, sans attendre le prochain rendez-vous. Contactez votre gynécologue ou rendez-vous aux urgences de la maternité la plus proche. En cas de détresse, appelez le SAMU au 15. Ces signes peuvent traduire une complication qui se traite d'autant mieux qu'elle est prise en charge tôt." },
      { q: "Comment se préparer à une première consultation gynécologique ?", a: "Notez la date de vos dernières règles, la régularité de votre cycle et vos éventuels symptômes. Apportez vos anciens résultats (frottis, échographies, analyses) et la liste de vos traitements. Il est conseillé d'éviter les rapports et les ovules dans les 48 heures précédant un frottis. N'hésitez pas à préparer vos questions à l'avance : la consultation est un espace confidentiel où tout peut être abordé." },
      { q: "À quel spécialiste s'adresser pour des difficultés à concevoir ?", a: "Après environ un an de rapports réguliers sans grossesse (six mois après 35 ans), il est conseillé de consulter un gynécologue, qui pourra orienter vers un bilan de fertilité du couple. Certains gynécologues ont une orientation en médecine de la reproduction et travaillent avec des centres d'AMP (assistance médicale à la procréation). Le bilan explore aussi bien la femme que l'homme et permet de proposer une prise en charge adaptée." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "1 fois / an", label: "Suivi gynécologique conseillé" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Le suivi gynécologique annuel et le frottis",
        body: [
          "Une consultation gynécologique annuelle est recommandée dès le début de la vie sexuelle, même en l'absence de symptôme. Elle comprend un examen et, périodiquement, un frottis cervico-utérin.",
          "Le frottis dépiste précocement les lésions du col de l'utérus, évitant l'évolution vers un cancer. C'est l'un des dépistages les plus efficaces de la santé de la femme.",
        ],
      },
      {
        h: "Grossesse : le suivi prénatal au Maroc",
        body: [
          "Le suivi de grossesse associe consultations mensuelles et échographies (datation, morphologie, croissance) pour surveiller la santé de la mère et du bébé et dépister d'éventuelles complications.",
          "Le gynécologue-obstétricien prend en charge les grossesses, y compris à risque, et l'accouchement. Un suivi régulier dès le début de la grossesse est essentiel à sa bonne évolution.",
        ],
      },
      {
        h: "Contraception et planification familiale",
        body: [
          "Le gynécologue accompagne le choix d'une contraception adaptée (pilule, stérilet, implant) selon l'âge, les antécédents et le mode de vie, et assure son suivi.",
          "Il informe aussi sur la planification familiale et la prévention des infections sexuellement transmissibles, dans un cadre confidentiel et sans jugement.",
        ],
      },
      {
        h: "Dépistage des cancers féminins",
        body: [
          "Au-delà du frottis pour le col de l'utérus, le gynécologue participe au dépistage du cancer du sein par l'examen clinique et l'orientation vers la mammographie aux âges recommandés.",
          "Détectés tôt, ces cancers se traitent avec de bien meilleures chances de guérison. Le suivi régulier est la clé d'une prévention efficace.",
        ],
      },
      {
        h: "Ménopause et santé de la femme après 45 ans",
        body: [
          "La ménopause, qui survient généralement autour de la cinquantaine, marque l'arrêt des cycles et s'accompagne parfois de bouffées de chaleur, de troubles du sommeil ou de sécheresse. La période qui la précède, la périménopause, peut durer plusieurs années avec des cycles irréguliers. Le gynécologue accompagne cette transition, écarte les autres causes possibles des symptômes et propose, quand c'est justifié, un traitement adapté après évaluation du rapport bénéfice-risque.",
          "Au-delà du confort au quotidien, cette étape est l'occasion d'un suivi renforcé : surveillance osseuse pour prévenir l'ostéoporose, contrôle du cœur et des vaisseaux, et poursuite du dépistage des cancers du sein et du col. Au Maroc, ce suivi combine consultations gynécologiques et, selon les besoins, avis d'autres spécialistes. Une bonne hygiène de vie (activité physique, alimentation équilibrée, arrêt du tabac) reste le socle de la prévention à cet âge.",
        ],
      },
      {
        h: "Infections gynécologiques et santé intime : quand consulter",
        body: [
          "Pertes inhabituelles, démangeaisons, brûlures en urinant ou douleurs pendant les rapports sont des motifs fréquents de consultation au Maroc. La plupart de ces troubles, comme les mycoses ou les vaginoses, se soignent facilement une fois le diagnostic posé. L'automédication répétée peut au contraire masquer une infection sous-jacente ou entretenir des récidives : un examen et, si besoin, un prélèvement permettent d'orienter le traitement précisément.",
          "Certaines infections sexuellement transmissibles peuvent évoluer discrètement et, non traitées, retentir sur la fertilité. Le gynécologue propose un dépistage, informe sur la prévention (préservatif, vaccination contre le papillomavirus quand elle est indiquée) et prend en charge le ou la partenaire lorsque c'est nécessaire. En cas de fièvre élevée avec douleurs pelviennes intenses, une évaluation urgente s'impose, au besoin via les urgences ou le SAMU (15).",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un gynécologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens et le suivi de grossesse sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Frottis cervico-utérin", value: "150 – 400 MAD" },
        { label: "Échographie pelvienne", value: "300 – 600 MAD" },
        { label: "Échographie obstétricale (grossesse)", value: "400 – 800 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel, notamment pour le suivi de grossesse.",
    },
  },

  "dermatologie": {
    synonyme: "dermatologue",
    reviewed: "2026-07-05",
    description:
      "Le dermatologue est le spécialiste des maladies de la peau, des muqueuses, des cheveux et des ongles. Il diagnostique et traite l'acné, l'eczéma, le psoriasis, les infections cutanées, les allergies et surveille les lésions suspectes pouvant évoquer un mélanome. Au Maroc, la forte exposition solaire rend le suivi dermatologique particulièrement important pour le dépistage précoce des cancers de la peau. Le dermatologue réalise également des actes esthétiques comme le traitement des cicatrices, le peeling et l'injection d'acide hyaluronique.",
    quandConsulter: [
      "Acné sévère ou résistante aux traitements locaux",
      "Éruptions cutanées, eczéma ou psoriasis",
      "Surveillance d'une lésion ou d'un grain de beauté suspect",
      "Chute de cheveux (alopécie)",
      "Infections cutanées ou mycoses persistantes",
    ],
    faqs: [
      {
        q: "Quand faut-il consulter un dermatologue en urgence ?",
        a: "Consultez rapidement un dermatologue si vous observez un grain de beauté qui change de forme, de couleur ou saigne, une lésion cutanée qui ne guérit pas, ou une éruption généralisée accompagnée de fièvre.",
      },
      {
        q: "Combien coûte une consultation dermatologique au Maroc ?",
        a: "Le prix d'une consultation chez un dermatologue varie entre 250 et 500 MAD au Maroc selon la ville et les actes réalisés. Les biopsies cutanées ou cryothérapies font l'objet de frais supplémentaires.",
      },
      {
        q: "Le dermatologue traite-t-il les problèmes de cheveux ?",
        a: "Oui, le dermatologue prend en charge les affections du cuir chevelu et les chutes de cheveux (alopécie androgénétique, pelade), et réalise des biopsies du cuir chevelu si nécessaire.",
      },
      {
        q: "Comment trouver un dermatologue au Maroc ?",
        a: "SantéauMaroc liste tous les dermatologues référencés avec leurs avis patients, tarifs et disponibilités pour une prise de rendez-vous en ligne immédiate.",
      },
      { q: "Faut-il une lettre de mon médecin traitant pour consulter un dermatologue au Maroc ?", a: "Non, le dermatologue est un spécialiste en accès direct : vous pouvez prendre rendez-vous sans passer par un médecin généraliste au préalable. Certaines mutuelles ou l'AMO peuvent toutefois demander une feuille de soins ou une prescription pour le remboursement de certains actes ou traitements. Il est utile de vérifier les conditions de votre couverture avant la consultation." },
      { q: "Comment préparer sa consultation chez le dermatologue ?", a: "Venez avec une peau propre, sans maquillage ni vernis à ongles si le motif concerne le visage, la peau ou les ongles, car cela facilite l'examen. Apportez la liste de vos traitements en cours, vos anciennes ordonnances et les crèmes déjà essayées. Notez la date d'apparition de la lésion et son évolution : ces informations orientent souvent le diagnostic." },
      { q: "Le dermatologue peut-il faire une biopsie de la peau lors de la consultation ?", a: "Oui, une petite biopsie cutanée peut être réalisée directement au cabinet sous anesthésie locale, en quelques minutes, pour analyser une lésion suspecte. Le prélèvement est ensuite envoyé à un laboratoire d'anatomopathologie et les résultats reviennent généralement sous une à deux semaines. C'est un geste courant et peu douloureux qui permet de confirmer un diagnostic." },
      { q: "À partir de quel âge peut-on emmener un enfant chez le dermatologue ?", a: "Il n'y a pas d'âge minimum : nourrissons et enfants peuvent consulter pour des problèmes fréquents comme l'eczéma, les angiomes, les verrues ou les taches de naissance. Certains dermatologues au Maroc ont une orientation pédiatrique. En cas de fièvre associée à une éruption chez un jeune enfant, contactez d'abord un médecin ou le 15 (SAMU) sans attendre." },
      { q: "Quels examens le dermatologue peut-il prescrire ou réaliser ?", a: "Selon le motif, il peut réaliser une dermoscopie (examen des grains de beauté à la loupe éclairée), un prélèvement mycologique pour rechercher un champignon, ou une biopsie. Il peut aussi prescrire un bilan sanguin, un bilan allergologique ou un examen bactériologique. Ces examens complémentaires ne sont pas systématiques et dépendent de votre situation." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Peau · cheveux · ongles", label: "Champ de la spécialité" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Acné : agir tôt pour éviter les cicatrices",
        body: [
          "L'acné, fréquente à l'adolescence mais aussi chez l'adulte, peut laisser des cicatrices durables si elle n'est pas traitée. Le dermatologue propose des traitements adaptés à sa sévérité, des soins locaux aux traitements oraux.",
          "Une prise en charge précoce limite les lésions et préserve la peau à long terme. Évitez l'automédication agressive, qui aggrave souvent l'inflammation.",
        ],
      },
      {
        h: "Surveiller ses grains de beauté : le dépistage du mélanome",
        body: [
          "Au Maroc, la forte exposition solaire augmente le risque de lésions cutanées. Tout grain de beauté qui change de forme, de couleur, de taille, ou qui saigne, doit être montré à un dermatologue.",
          "Un examen régulier de la peau permet de dépister précocement le mélanome et les autres cancers cutanés, dont le pronostic est excellent lorsqu'ils sont pris à temps.",
        ],
      },
      {
        h: "Eczéma, psoriasis et maladies chroniques de la peau",
        body: [
          "L'eczéma et le psoriasis sont des maladies inflammatoires chroniques qui évoluent par poussées. Elles ne se guérissent pas définitivement mais se contrôlent bien avec un traitement adapté.",
          "Le dermatologue identifie les facteurs déclenchants (stress, allergènes, climat) et propose une stratégie pour espacer les poussées et améliorer le confort de vie.",
        ],
      },
      {
        h: "Dermatologie esthétique : ce qui est remboursé ou non",
        body: [
          "Le dermatologue réalise aussi des actes esthétiques : traitement des cicatrices, peelings, lasers, injections. Ces actes relèvent du confort et ne sont généralement pas remboursés.",
          "En revanche, les consultations et traitements à visée médicale (acné, lésions suspectes, maladies de peau) bénéficient d'une prise en charge partielle par la CNSS et l'AMO.",
        ],
      },
      {
        h: "Peau et soleil au Maroc : prévention et coups de soleil",
        body: [
          "Avec un fort ensoleillement une grande partie de l'année, la protection solaire est un enjeu de santé quotidien au Maroc. L'exposition répétée sans protection accélère le vieillissement de la peau et augmente le risque de lésions cutanées à long terme. Le dermatologue recommande une protection adaptée à votre type de peau : crème à indice élevé renouvelée toutes les deux heures en cas d'exposition, chapeau, lunettes et vêtements couvrants aux heures les plus chaudes, en évitant l'exposition directe entre midi et 16 heures.",
          "Certaines personnes présentent des réactions particulières au soleil : taches pigmentaires (melasma, fréquent après une grossesse), allergies solaires ou aggravation de maladies existantes. Un coup de soleil sévère avec cloques, fièvre ou malaise, surtout chez un enfant, justifie un avis médical rapide, voire un appel au 15 (SAMU) en cas de signes de déshydratation. Le dermatologue peut proposer un traitement des taches et un plan de prévention personnalisé.",
        ],
      },
      {
        h: "Comprendre les honoraires et le remboursement des actes dermatologiques",
        body: [
          "Au Maroc, les honoraires des dermatologues du secteur privé sont libres et varient selon la ville, l'expérience du praticien et la nature de l'acte. Une consultation simple, une dermoscopie, une biopsie ou un acte technique n'ont pas le même tarif : il est légitime de demander le montant à la prise de rendez-vous. Dans le secteur public (hôpitaux, CHU), les tarifs sont encadrés et généralement plus accessibles, avec toutefois des délais d'attente parfois plus longs.",
          "Le remboursement dépend de votre couverture : l'AMO (via la CNSS ou d'autres organismes) prend en charge une partie des consultations et actes médicaux selon la tarification nationale de référence (TNR) fixée par l'ANAM, tandis qu'une mutuelle complémentaire peut couvrir le reste. Les actes purement esthétiques ne sont pas remboursés. Conservez toujours vos feuilles de soins et factures détaillées, et vérifiez auprès de votre organisme les conditions de prise en charge avant un acte coûteux.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un dermatologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les actes techniques et esthétiques sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Cryothérapie (verrue, lésion)", value: "150 – 400 MAD" },
        { label: "Biopsie cutanée", value: "300 – 700 MAD" },
        { label: "Acte esthétique (peeling, laser)", value: "À partir de 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les actes médicaux sont partiellement remboursés par la CNSS et l'AMO ; les actes esthétiques ne le sont pas.",
    },
  },

  "ophtalmologie": {
    synonyme: "ophtalmologue",
    reviewed: "2026-07-05",
    description:
      "L'ophtalmologue est le médecin spécialiste de l'œil et de la vision. Il diagnostique et traite les maladies oculaires : myopie, hypermétropie, astigmatisme, cataracte, glaucome, dégénérescence maculaire liée à l'âge (DMLA) et rétinopathie diabétique. Au Maroc, la prévalence du glaucome et de la cataracte justifie un dépistage régulier, notamment après 40 ans. L'ophtalmologue prescrit également les corrections optiques (lunettes et lentilles de contact) après examen complet de la réfraction.",
    quandConsulter: [
      "Baisse brutale ou progressive de la vision",
      "Douleur oculaire ou rougeur persistante",
      "Contrôle de vue pour lunettes ou lentilles de contact",
      "Dépistage du glaucome (recommandé après 40 ans)",
      "Suivi du diabète (rétinopathie diabétique)",
    ],
    faqs: [
      {
        q: "À quelle fréquence consulter un ophtalmologue ?",
        a: "Un contrôle tous les 2 ans est recommandé pour les adultes sans pathologie. Après 40 ans, un dépistage annuel du glaucome est conseillé. Les diabétiques doivent consulter tous les 6 à 12 mois.",
      },
      {
        q: "Quelle différence entre opticien et ophtalmologue ?",
        a: "L'ophtalmologue est un médecin qui diagnostique les maladies oculaires et prescrit les corrections. L'opticien est un professionnel de santé qui délivre et ajuste les lunettes selon l'ordonnance médicale.",
      },
      {
        q: "Combien coûte une consultation chez un ophtalmologue au Maroc ?",
        a: "Une consultation ophtalmologique coûte entre 250 et 500 MAD selon la ville et les examens. Le fond d'œil, la tonométrie ou l'OCT font l'objet de frais complémentaires.",
      },
      {
        q: "Peut-on se faire opérer de la myopie au Maroc ?",
        a: "Oui, plusieurs cliniques marocaines proposent la chirurgie réfractive (LASIK, PKR) pour corriger la myopie. Consultez un ophtalmologue pour évaluer si vous êtes éligible selon l'épaisseur de votre cornée.",
      },
      { q: "Le suivi ophtalmologique est-il remboursé par la CNSS ou l'AMO au Maroc ?", a: "Les consultations et certains actes d'ophtalmologie ouvrent droit à un remboursement partiel via l'AMO (CNSS pour les salariés, CNOPS pour la fonction publique) sur la base du tarif national de référence (TNR/ANAM). Comme les honoraires du secteur privé sont libres, le reste à charge peut être important. Demandez toujours une feuille de soins et renseignez-vous sur la prise en charge avant une chirurgie programmée (cataracte, par exemple)." },
      { q: "À quel âge faire examiner les yeux de mon enfant ?", a: "Un premier dépistage est recommandé dès les premiers mois, puis vers 3 ans et avant l'entrée à l'école, même sans signe apparent. Un enfant qui plisse les yeux, se rapproche des écrans, penche la tête ou peine à l'école doit être examiné rapidement. Dépister tôt un strabisme ou une amblyopie (« œil paresseux ») est essentiel, car le traitement est bien plus efficace avant 6-7 ans." },
      { q: "Les écrans abîment-ils vraiment les yeux et comment soulager la fatigue visuelle ?", a: "Les écrans ne détériorent pas la structure de l'œil, mais leur usage prolongé provoque fréquemment une fatigue visuelle et une sécheresse oculaire (moins de clignements). La règle du 20-20-20 aide : toutes les 20 minutes, regarder à environ 6 mètres pendant 20 secondes. Si la gêne, les maux de tête ou la vision floue persistent, consultez un ophtalmologue pour vérifier votre correction." },
      { q: "Le diabète peut-il affecter la vue et quel suivi prévoir ?", a: "Oui, le diabète est une cause fréquente d'atteinte de la rétine (rétinopathie diabétique) au Maroc et peut évoluer longtemps sans symptôme. Un examen du fond d'œil au moins une fois par an est recommandé chez tout patient diabétique, plus souvent en cas d'anomalie. Un bon équilibre de la glycémie et de la tension aide à préserver la vue." },
      { q: "Quels signes oculaires imposent une consultation en urgence ?", a: "Consultez en urgence en cas de baisse brutale de la vision, de douleur oculaire intense, d'un rideau ou d'éclairs et de mouches soudaines, d'un œil rouge très douloureux avec vision trouble, ou après une projection de produit chimique ou un traumatisme. En cas de projection chimique, rincez abondamment à l'eau immédiatement. Face à un tableau grave ou général, appelez le 15 (SAMU)." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Dès 40 ans", label: "Dépistage du glaucome" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Quand contrôler sa vue ?",
        body: [
          "Un contrôle de la vue tous les deux ans est conseillé pour l'adulte sans pathologie, et chaque année après 40 ans pour dépister le glaucome. Les enfants doivent être examinés en cas de signes (yeux qui louchent, difficulté à voir le tableau).",
          "Les personnes diabétiques nécessitent un suivi rapproché (tous les 6 à 12 mois) pour dépister la rétinopathie diabétique, cause majeure de cécité évitable au Maroc.",
        ],
      },
      {
        h: "Glaucome et cataracte : deux pathologies à dépister",
        body: [
          "Le glaucome abîme silencieusement le nerf optique en lien avec une pression oculaire élevée ; sans dépistage, il peut conduire à la cécité. Un simple contrôle après 40 ans permet de le détecter et de le traiter à temps.",
          "La cataracte, opacification du cristallin liée à l'âge, brouille progressivement la vision. Son traitement chirurgical, fréquent et bien maîtrisé au Maroc, restaure efficacement la vue.",
        ],
      },
      {
        h: "Ophtalmologue ou opticien : qui fait quoi ?",
        body: [
          "L'ophtalmologue est un médecin : il examine les yeux, dépiste les maladies et délivre l'ordonnance de correction. L'opticien réalise et adapte les lunettes et lentilles à partir de cette ordonnance.",
          "Pour des lunettes adaptées et un dépistage des maladies oculaires, l'examen chez l'ophtalmologue reste l'étape de référence ; l'opticien intervient ensuite pour l'équipement.",
        ],
      },
      {
        h: "Chirurgie de la myopie et corrections",
        body: [
          "La chirurgie réfractive (LASIK, PKR) permet de corriger myopie, hypermétropie et astigmatisme, proposée dans plusieurs cliniques marocaines après un bilan vérifiant l'épaisseur de la cornée et la stabilité de la vue.",
          "Tous les patients ne sont pas éligibles. L'ophtalmologue évalue la faisabilité et informe sur les bénéfices et les limites avant toute décision.",
        ],
      },
      {
        h: "Diabète, hypertension et santé des yeux : l'importance du fond d'œil",
        body: [
          "Certaines maladies générales très répandues au Maroc, comme le diabète et l'hypertension artérielle, retentissent directement sur les yeux. Le diabète peut endommager progressivement les vaisseaux de la rétine (rétinopathie diabétique) sans provoquer de douleur ni de baisse de vision au début : c'est précisément ce silence qui le rend dangereux. L'hypertension mal contrôlée fragilise également la rétine. Pour ces raisons, l'ophtalmologue joue un rôle clé de dépistage, en lien avec le médecin traitant, l'endocrinologue ou le cardiologue.",
          "L'examen central est le fond d'œil, souvent complété par des clichés de la rétine. Chez un patient diabétique, un contrôle au moins annuel est généralement recommandé, à adapter selon l'ancienneté du diabète et les résultats. Détectée à temps, une rétinopathie peut être surveillée ou traitée (laser, injections) avant d'atteindre la vision. Au-delà du suivi spécialisé, le meilleur allié reste le bon équilibre de la glycémie, de la tension et l'arrêt du tabac.",
        ],
      },
      {
        h: "Sécheresse oculaire et fatigue visuelle liée aux écrans",
        body: [
          "La sécheresse oculaire est un motif de consultation de plus en plus fréquent, favorisée par le travail sur écran, la climatisation, le vent, la poussière et le port prolongé de lentilles. Elle se manifeste par une sensation de sable dans les yeux, des picotements, une rougeur, une vision qui fluctue ou, paradoxalement, un larmoiement réactionnel. Devant des écrans, on cligne beaucoup moins des yeux, ce qui accentue l'inconfort au fil de la journée.",
          "Quelques mesures simples soulagent souvent : appliquer la règle du 20-20-20 (une pause visuelle régulière), penser à cligner, aérer et humidifier l'air, bien positionner l'écran sous le niveau des yeux et faire des pauses lors du port de lentilles. Les larmes artificielles sans conservateur peuvent aider, mais une gêne persistante, une douleur ou une baisse de vision justifient un examen : l'ophtalmologue vérifie la surface de l'œil, la correction optique et écarte une autre cause avant de proposer un traitement adapté.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un ophtalmologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens et la chirurgie sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Fond d'œil / examen complémentaire", value: "150 – 400 MAD" },
        { label: "Opération de la cataracte (par œil)", value: "5 000 – 12 000 MAD" },
        { label: "Chirurgie réfractive LASIK (par œil)", value: "5 000 – 9 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des actes médicaux sur présentation de l'ordonnance ; la chirurgie esthétique réfractive est rarement prise en charge.",
    },
  },

  "neurologie": {
    synonyme: "neurologue",
    description:
      "Le neurologue est le médecin spécialiste des maladies du système nerveux central et périphérique. Il prend en charge les migraines, épilepsies, accidents vasculaires cérébraux (AVC), maladies de Parkinson et d'Alzheimer, sclérose en plaques, neuropathies et troubles du sommeil. Au Maroc, les AVC représentent une urgence neurologique majeure : reconnaître les signes précoces (paralysie, troubles du langage) et consulter rapidement peut sauver des vies et limiter les séquelles.",
    quandConsulter: [
      "Maux de tête sévères ou migraines récurrentes",
      "Perte de connaissance ou crise d'épilepsie",
      "Paralysie ou engourdissement soudain (urgence AVC)",
      "Tremblements ou troubles de l'équilibre",
      "Troubles de la mémoire ou de la concentration",
    ],
    faqs: [
      {
        q: "Quels sont les signes d'un AVC à connaître ?",
        a: "Appliquez le test FAST : Face (visage asymétrique), Arms (bras qui tombe), Speech (troubles du langage), Time (appelez le SAMU immédiatement). Chaque minute compte pour limiter les séquelles.",
      },
      {
        q: "Combien coûte une consultation chez un neurologue au Maroc ?",
        a: "Une consultation neurologique coûte entre 300 et 600 MAD au Maroc. Les examens complémentaires (EEG, EMG, IRM cérébrale) font l'objet de frais supplémentaires.",
      },
      {
        q: "Faut-il une ordonnance pour consulter un neurologue ?",
        a: "Une référence du médecin généraliste est recommandée pour une meilleure prise en charge et le remboursement par la CNSS ou l'AMO, mais n'est pas obligatoire pour consulter directement.",
      },
      {
        q: "Comment trouver un neurologue au Maroc ?",
        a: "SantéauMaroc liste les neurologues référencés avec leurs avis et disponibilités. Filtrez par ville pour trouver le praticien le plus proche et réserver en ligne.",
      },
      { q: "Une IRM cérébrale est-elle remboursée par la CNSS ou l'AMO au Maroc ?", a: "L'IRM et le scanner cérébral prescrits par un neurologue sont pris en charge par l'AMO (CNSS ou CNOPS) selon la Tarification Nationale de Référence, avec un ticket modérateur restant à votre charge. Le taux de remboursement dépend de votre régime et du secteur (public ou privé conventionné). Conservez l'ordonnance et la prise en charge éventuelle pour constituer votre dossier de remboursement." },
      { q: "Quelle est la différence entre un neurologue et un neurochirurgien ?", a: "Le neurologue est un médecin spécialiste qui diagnostique et traite par des moyens médicamenteux les maladies du système nerveux (AVC, migraine, épilepsie, sclérose en plaques). Le neurochirurgien opère (hernie discale, tumeur cérébrale, compression nerveuse). Au Maroc, le neurologue vous orientera vers un neurochirurgien si une intervention est nécessaire ; les deux collaborent souvent sur un même dossier." },
      { q: "Un électroencéphalogramme (EEG) est-il douloureux ?", a: "Non, l'EEG est totalement indolore et sans danger. Des électrodes sont posées sur le cuir chevelu pour enregistrer l'activité électrique du cerveau ; aucun courant n'est envoyé dans la tête. L'examen dure environ 20 à 30 minutes et se pratique en cabinet neurologique ou en clinique, souvent pour explorer une épilepsie ou des malaises inexpliqués." },
      { q: "Que faire en cas de fourmillements ou d'engourdissements persistants dans les mains ou les jambes ?", a: "Des fourmillements chroniques (paresthésies) peuvent traduire une atteinte des nerfs périphériques, fréquente notamment chez les personnes diabétiques au Maroc. Une consultation neurologique, parfois complétée par un électromyogramme (EMG), permet d'en identifier la cause. En revanche, un engourdissement brutal d'un côté du corps est une urgence : appelez immédiatement le 15 (SAMU) car il peut s'agir d'un AVC." },
      { q: "Peut-on conduire quand on est suivi pour une épilepsie ou une maladie neurologique au Maroc ?", a: "La conduite peut être contre-indiquée temporairement, notamment après une crise d'épilepsie ou en cas de somnolence liée à certains traitements. Votre neurologue évalue votre aptitude au cas par cas et vous conseille sur les délais à respecter. Il est important de suivre ces recommandations pour votre sécurité et celle des autres usagers de la route." },
    ],
    reviewed: "2026-07-05",
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Urgence AVC", label: "Test FAST · appeler le 15" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "AVC : reconnaître les signes et agir vite",
        body: [
          "L'accident vasculaire cérébral est une urgence absolue. Le test FAST résume les signes à connaître : Face (visage qui tombe d'un côté), Arms (un bras qui ne se lève plus), Speech (parole troublée), Time (appelez immédiatement le 15). Chaque minute perdue augmente les séquelles.",
          "Au Maroc, l'AVC est une cause majeure de handicap. Une prise en charge dans les toutes premières heures peut dissoudre le caillot et limiter les dégâts : ne minimisez jamais un déficit brutal, même transitoire.",
        ],
      },
      {
        h: "Migraines et maux de tête chroniques",
        body: [
          "La migraine se distingue d'un simple mal de tête par des crises intenses, souvent d'un seul côté, pulsatiles, aggravées par la lumière et le bruit. Elle peut être très invalidante et justifie un avis lorsqu'elle est fréquente.",
          "Le neurologue confirme le diagnostic, écarte les causes secondaires et propose un traitement de crise ainsi qu'un traitement de fond pour réduire la fréquence des épisodes et retrouver une vie normale.",
        ],
      },
      {
        h: "Épilepsie : diagnostic et suivi",
        body: [
          "L'épilepsie se manifeste par des crises liées à une activité électrique anormale du cerveau, de formes très variées (convulsions, absences, sensations inhabituelles). Un électroencéphalogramme (EEG) et une imagerie aident au diagnostic.",
          "Bien traitée, l'épilepsie permet le plus souvent une vie normale. Le neurologue adapte le traitement, explique les précautions (sommeil, conduite) et assure un suivi régulier.",
        ],
      },
      {
        h: "Parkinson, Alzheimer et troubles de la mémoire",
        body: [
          "Les maladies neuro-dégénératives (Parkinson, Alzheimer) apparaissent surtout avec l'âge : tremblement et lenteur pour l'une, troubles de la mémoire et de l'orientation pour l'autre. Elles évoluent progressivement.",
          "Un diagnostic précoce permet d'instaurer un traitement, d'accompagner le patient et sa famille et de préserver plus longtemps l'autonomie. Toute plainte de mémoire persistante mérite un avis neurologique.",
        ],
      },
      {
        h: "Sclérose en plaques : diagnostic et prise en charge au Maroc",
        body: [
          "La sclérose en plaques (SEP) est une maladie du système nerveux central qui touche souvent le sujet jeune. Elle se manifeste par des poussées imprévisibles : troubles de la vision, fatigue intense, faiblesse ou fourmillements dans les membres, troubles de l'équilibre. Le diagnostic repose sur l'examen clinique du neurologue, l'IRM cérébrale et médullaire, et parfois une ponction lombaire. Un diagnostic précoce est essentiel pour préserver l'autonomie sur le long terme.",
          "Au Maroc, la prise en charge associe des traitements de fond (immunomodulateurs), le traitement des poussées et une rééducation adaptée. Le suivi neurologique régulier permet d'ajuster le traitement et de surveiller l'évolution par IRM. Certains traitements de fond peuvent bénéficier d'une prise en charge AMO dans le cadre des affections de longue durée (ALD) ; renseignez-vous auprès de votre organisme (CNSS ou CNOPS) et gardez tous vos justificatifs médicaux.",
        ],
      },
      {
        h: "Préparer efficacement sa consultation chez le neurologue",
        body: [
          "Une consultation neurologique gagne en efficacité si vous la préparez. Notez la chronologie précise de vos symptômes (date d'apparition, fréquence, durée, facteurs déclenchants comme le stress, le manque de sommeil ou certains aliments) et apportez la liste de tous vos médicaments actuels. Ces informations orientent fortement le diagnostic, en particulier pour les maux de tête, les malaises ou les troubles de la mémoire.",
          "Pensez à réunir vos examens antérieurs : comptes rendus d'IRM ou de scanner, résultats d'EEG ou d'EMG, ordonnances précédentes et bilans sanguins. Si vos symptômes sont épisodiques (crises, vertiges, tremblements), une courte vidéo prise avec votre téléphone lors d'un épisode peut être très utile au neurologue. Enfin, venez accompagné si des troubles de la mémoire ou de la vigilance rendent le récit difficile.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un neurologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens complémentaires sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Électroencéphalogramme (EEG)", value: "300 – 700 MAD" },
        { label: "Électromyogramme (EMG)", value: "400 – 900 MAD" },
        { label: "IRM cérébrale", value: "1 500 – 3 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "endocrinologie-et-maladies-metaboliques": {
    synonyme: "endocrinologue",
    reviewed: "2026-07-05",
    description:
      "L'endocrinologue est le médecin spécialiste des hormones et des maladies métaboliques. Il diagnostique et traite le diabète, les troubles de la thyroïde (hypothyroïdie, hyperthyroïdie, nodules, goitre), l'obésité, les troubles du cholestérol, l'ostéoporose et les dérèglements hormonaux (hypophyse, surrénales, hormones sexuelles). Au Maroc, le diabète et les maladies de la thyroïde sont en forte progression, ce qui fait de l'endocrinologue un acteur clé de la prévention des complications (cœur, reins, yeux, nerfs). Il s'appuie sur des analyses biologiques (glycémie, HbA1c, bilan hormonal), l'échographie thyroïdienne et un accompagnement du mode de vie pour équilibrer durablement ces maladies chroniques.",
    quandConsulter: [
      "Diabète : découverte, déséquilibre ou suivi",
      "Troubles de la thyroïde (fatigue, variation de poids, nodule)",
      "Surpoids, obésité ou syndrome métabolique",
      "Cholestérol ou triglycérides élevés",
      "Troubles hormonaux (croissance, puberté, règles, pilosité)",
    ],
    faqs: [
      {
        q: "Quand consulter un endocrinologue ?",
        a: "On consulte un endocrinologue pour un diabète (dépistage, déséquilibre ou suivi), un trouble de la thyroïde, une obésité, un cholestérol élevé ou un dérèglement hormonal. Le médecin généraliste oriente souvent, mais la consultation directe est possible.",
      },
      {
        q: "Combien coûte une consultation chez un endocrinologue au Maroc ?",
        a: "Une consultation coûte généralement entre 250 et 500 MAD selon la ville et le praticien. Les analyses biologiques (glycémie, HbA1c, bilan hormonal) et l'échographie thyroïdienne sont facturées à part ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "Endocrinologue ou diabétologue : quelle différence ?",
        a: "Le diabétologue est un endocrinologue particulièrement dédié au diabète. Au Maroc, la plupart des praticiens exercent l'endocrinologie-diabétologie et prennent en charge à la fois le diabète, la thyroïde et les autres maladies hormonales.",
      },
      {
        q: "Comment prendre rendez-vous avec un endocrinologue au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Endocrinologie et maladies métaboliques » et votre ville pour trouver un praticien disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Comment préparer sa première consultation chez un endocrinologue ?", a: "Apportez vos analyses de sang récentes (glycémie, HbA1c, bilan thyroïdien, cholestérol), la liste de vos médicaments en cours et vos comptes rendus d'imagerie éventuels (échographie thyroïdienne, IRM). Notez vos symptômes, leur ancienneté et vos antécédents familiaux. Venez à jeun uniquement si un bilan sanguin est prévu le jour même, ce que le secrétariat peut préciser lors de la prise de rendez-vous." },
      { q: "La consultation et les examens en endocrinologie sont-ils remboursés au Maroc ?", a: "Dans le privé, les honoraires sont libres et vous êtes remboursé partiellement par l'AMO (CNSS ou CNOPS) selon la Tarification Nationale de Référence de l'ANAM, après avoir avancé les frais. Dans le secteur public (CHU, hôpitaux), la prise en charge est plus accessible, notamment via le RAMED/AMO Tadamon. De nombreux examens hormonaux et l'imagerie peuvent être partiellement couverts, mais mieux vaut vérifier les taux avec votre organisme et conserver toutes les factures." },
      { q: "L'endocrinologue traite-t-il aussi les glandes surrénales et l'hypophyse ?", a: "Oui, l'endocrinologue prend en charge l'ensemble des glandes hormonales, dont les surrénales (insuffisance surrénalienne, excès de cortisol, hyperaldostéronisme) et l'hypophyse (adénomes, troubles de la prolactine, de la croissance ou de la posthypophyse). Ces pathologies plus rares nécessitent souvent des dosages hormonaux spécialisés et une imagerie dédiée. La prise en charge est généralement coordonnée avec un radiologue et, si besoin, un neurochirurgien." },
      { q: "À quelle fréquence faut-il contrôler son HbA1c quand on est diabétique ?", a: "En règle générale, l'hémoglobine glyquée (HbA1c) se contrôle tous les 3 mois tant que l'équilibre n'est pas atteint, puis tous les 6 mois lorsque les objectifs sont stables. Votre endocrinologue adapte ce rythme à votre traitement, à votre type de diabète et à d'éventuelles complications. Ce dosage reflète la moyenne des glycémies des deux à trois derniers mois et guide les ajustements thérapeutiques." },
      { q: "Un endocrinologue suit-il aussi les enfants et les adolescents ?", a: "Certains endocrinologues ont une orientation pédiatrique et suivent les troubles de la croissance, de la puberté, le diabète de l'enfant ou les problèmes thyroïdiens. Au Maroc, ces prises en charge sont souvent assurées dans les services d'endocrinologie pédiatrique des CHU. Pour un enfant, il est conseillé de préciser au secrétariat le motif afin d'être orienté vers un praticien compétent en pédiatrie." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Diabète · thyroïde", label: "Motifs les plus fréquents" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Diabète : équilibre et prévention des complications",
        body: [
          "Le diabète, en forte progression au Maroc, se caractérise par un excès de sucre dans le sang qui, mal contrôlé, abîme silencieusement le cœur, les reins, les yeux et les nerfs. Le suivi vise à maintenir un bon équilibre glycémique.",
          "L'endocrinologue s'appuie sur l'HbA1c (mémoire du sucre sur trois mois), ajuste le traitement (comprimés, insuline) et coordonne le dépistage des complications. L'éducation au mode de vie — alimentation, activité physique — est au cœur de la prise en charge.",
        ],
      },
      {
        h: "Maladies de la thyroïde : hypothyroïdie, hyperthyroïdie, nodules",
        body: [
          "La thyroïde règle le métabolisme. Son ralentissement (hypothyroïdie) provoque fatigue, frilosité et prise de poids ; son emballement (hyperthyroïdie) entraîne nervosité, palpitations et amaigrissement. Les nodules sont fréquents et le plus souvent bénins.",
          "L'endocrinologue confirme le diagnostic par un dosage hormonal (TSH) et une échographie, puis propose un traitement adapté et surveille les nodules pour écarter toute évolution suspecte.",
        ],
      },
      {
        h: "Obésité, cholestérol et syndrome métabolique",
        body: [
          "Le surpoids, l'hypertension, l'excès de cholestérol et de sucre forment souvent un syndrome métabolique qui augmente le risque cardiovasculaire. Une prise en charge globale est plus efficace que le traitement isolé de chaque facteur.",
          "L'endocrinologue accompagne la perte de poids, corrige les anomalies du cholestérol et travaille sur le mode de vie, en lien avec le médecin traitant et, si besoin, un nutritionniste.",
        ],
      },
      {
        h: "Diabète et grossesse, hormones et vie quotidienne",
        body: [
          "Certaines situations demandent un suivi hormonal rapproché : diabète gestationnel pendant la grossesse, troubles de la puberté ou des règles, pilosité excessive, ostéoporose après la ménopause.",
          "Un avis endocrinologique précoce permet d'éviter des complications et d'adapter le traitement à chaque étape de la vie.",
        ],
      },
      {
        h: "Ostéoporose, calcium et carence en vitamine D",
        body: [
          "L'endocrinologue prend en charge les troubles du métabolisme phosphocalcique, dont l'ostéoporose, les anomalies du calcium et de la parathyroïde (hyperparathyroïdie) et la carence en vitamine D, fréquente au Maroc y compris chez les personnes exposées au soleil, notamment en cas de peau couverte, de vie en intérieur ou après un certain âge. Le bilan associe dosages sanguins, parfois une densitométrie osseuse (ostéodensitométrie) et une évaluation des facteurs de risque de fracture.",
          "La prise en charge repose d'abord sur des mesures simples : apports suffisants en calcium par l'alimentation, correction d'une carence en vitamine D, activité physique adaptée et prévention des chutes. Un traitement médicamenteux peut être proposé selon le risque fracturaire, en particulier après la ménopause ou en présence d'antécédents de fractures. Un suivi régulier permet d'ajuster la supplémentation et de vérifier la tolérance.",
        ],
      },
      {
        h: "Troubles hormonaux de la reproduction et syndrome des ovaires polykystiques",
        body: [
          "L'endocrinologue intervient aussi sur les déséquilibres hormonaux touchant la fertilité et la vie reproductive : syndrome des ovaires polykystiques (SOPK), excès de pilosité (hirsutisme), troubles des règles, excès de prolactine ou baisse de la testostérone chez l'homme. Ces situations, fréquentes en consultation au Maroc, associent souvent un retentissement métabolique (surpoids, résistance à l'insuline) qui justifie une évaluation globale.",
          "La démarche combine interrogatoire, examen clinique, dosages hormonaux ciblés et, si nécessaire, une échographie. La prise en charge est individualisée : mesures d'hygiène de vie, traitement des symptômes gênants et coordination avec le gynécologue ou l'urologue lorsqu'un projet de grossesse ou une infertilité est en jeu. L'objectif est d'améliorer les symptômes tout en réduisant les risques métaboliques à long terme.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un endocrinologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les analyses et l'échographie sont facturées séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Bilan sanguin (glycémie, HbA1c)", value: "100 – 350 MAD" },
        { label: "Bilan hormonal (thyroïde…)", value: "200 – 600 MAD" },
        { label: "Échographie thyroïdienne", value: "300 – 600 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "rhumatologie": {
    synonyme: "rhumatologue",
    reviewed: "2026-07-05",
    description:
      "Le rhumatologue est le médecin spécialiste des maladies de l'appareil locomoteur : articulations, os, muscles, tendons et colonne vertébrale. Il diagnostique et traite l'arthrose, les rhumatismes inflammatoires (polyarthrite rhumatoïde, spondyloarthrite), la goutte, l'ostéoporose, les lombalgies et les douleurs articulaires chroniques. Contrairement à l'orthopédiste qui opère, le rhumatologue prend en charge ces affections de manière médicale : traitements, infiltrations, rééducation. Au Maroc, les douleurs articulaires et le mal de dos sont des motifs de consultation très fréquents, et le dépistage de l'ostéoporose gagne en importance après la ménopause. Le rhumatologue s'appuie sur l'examen clinique, la biologie et l'imagerie (radiographie, échographie, densitométrie osseuse) pour poser un diagnostic précis et éviter l'évolution vers le handicap.",
    quandConsulter: [
      "Douleurs articulaires persistantes ou gonflements",
      "Mal de dos chronique, lombalgie ou sciatique",
      "Rhumatisme inflammatoire (raideur matinale, articulations chaudes)",
      "Crise de goutte (orteil rouge et très douloureux)",
      "Dépistage de l'ostéoporose après la ménopause",
    ],
    faqs: [
      {
        q: "Quelle différence entre rhumatologue et orthopédiste ?",
        a: "Le rhumatologue traite médicalement les maladies des articulations et des os (arthrose, rhumatismes inflammatoires, ostéoporose) par des médicaments, des infiltrations et un suivi. L'orthopédiste est un chirurgien qui opère les traumatismes et les articulations très abîmées. Les deux approches sont complémentaires.",
      },
      {
        q: "Combien coûte une consultation chez un rhumatologue au Maroc ?",
        a: "Une consultation coûte généralement entre 250 et 500 MAD selon la ville et le praticien. Les examens (radiographie, échographie, densitométrie osseuse, bilan sanguin) sont facturés à part ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "Qu'est-ce qu'une infiltration et est-ce douloureux ?",
        a: "L'infiltration consiste à injecter un anti-inflammatoire directement dans ou autour d'une articulation douloureuse (genou, épaule, colonne). Réalisée sous anesthésie locale, elle est peu douloureuse et soulage souvent durablement l'arthrose ou une inflammation localisée.",
      },
      {
        q: "Comment prendre rendez-vous avec un rhumatologue au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Rhumatologie » et votre ville pour trouver un praticien disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Une infiltration ou un traitement chez le rhumatologue est-il remboursé au Maroc ?", a: "Les consultations et actes du rhumatologue sont partiellement remboursés par l'AMO (CNSS ou CNOPS) selon la tarification nationale de référence (TNR) de l'ANAM, sur la base d'un tarif conventionnel souvent inférieur aux honoraires réels du privé. Une part reste à votre charge. Les médicaments prescrits, la kinésithérapie et certaines biothérapies peuvent être pris en charge, parfois après accord préalable de votre organisme. Conservez feuilles de soins et ordonnances pour le remboursement." },
      { q: "Comment se préparer à une première consultation de rhumatologie ?", a: "Apportez tous vos examens antérieurs : radiographies, IRM, scanner, bilans sanguins et comptes rendus. Notez la localisation, l'ancienneté et le rythme de vos douleurs (matin, nuit, effort) ainsi que la liste de vos médicaments. Ces informations orientent le diagnostic et évitent de refaire des examens. Si vos douleurs sont surtout matinales avec un dérouillage long, précisez-le : cela oriente vers un rhumatisme inflammatoire." },
      { q: "Faut-il une lettre du médecin traitant pour consulter un rhumatologue ?", a: "Au Maroc, vous pouvez consulter directement un rhumatologue dans le secteur privé sans lettre d'orientation. Dans le secteur public (CHU, hôpital), l'accès se fait généralement après passage par un médecin généraliste ou une consultation de tri. Une lettre du médecin traitant reste utile car elle transmet votre historique et vos traitements en cours, ce qui fait gagner du temps au spécialiste." },
      { q: "La goutte relève-t-elle du rhumatologue au Maroc ?", a: "Oui. La goutte, liée à un excès d'acide urique, provoque des crises articulaires très douloureuses, souvent au gros orteil, et fait partie des motifs fréquents de consultation en rhumatologie au Maroc. Le rhumatologue confirme le diagnostic, traite la crise et met en place un traitement de fond pour éviter les récidives, avec des conseils alimentaires. En cas d'articulation brutalement rouge, chaude et fébrile, consultez rapidement pour écarter une infection." },
      { q: "Quels examens le rhumatologue peut-il prescrire ?", a: "Selon la situation, le rhumatologue prescrit des bilans sanguins (vitesse de sédimentation, CRP, facteur rhumatoïde, acide urique), des radiographies, une échographie articulaire, une IRM ou une ostéodensitométrie pour l'ostéoporose. Ces examens sont réalisés en cabinet de radiologie ou de biologie, publics ou privés. Certains sont partiellement remboursés par l'AMO ; pour l'IRM et le scanner, un accord préalable ou une avance de frais peuvent être demandés dans le privé." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Articulations & os", label: "Champ de la spécialité" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Arthrose : soulager et préserver les articulations",
        body: [
          "L'arthrose use progressivement le cartilage des articulations (genou, hanche, mains, colonne) et provoque douleurs et raideur, surtout avec l'âge, le surpoids ou après un traumatisme. C'est le rhumatisme le plus fréquent.",
          "Le rhumatologue soulage la douleur, propose une rééducation, des infiltrations et des mesures pour préserver la mobilité. Une prise en charge précoce ralentit l'évolution et retarde, voire évite, la chirurgie.",
        ],
      },
      {
        h: "Rhumatismes inflammatoires : polyarthrite et spondyloarthrite",
        body: [
          "Contrairement à l'arthrose mécanique, les rhumatismes inflammatoires (polyarthrite rhumatoïde, spondyloarthrite) se manifestent par une raideur matinale prolongée, des articulations gonflées et chaudes, parfois une atteinte de la colonne. Ils peuvent survenir chez l'adulte jeune.",
          "Un diagnostic précoce est crucial : les traitements de fond actuels (dont les biothérapies) contrôlent la maladie et évitent les déformations et le handicap. Toute douleur articulaire inflammatoire persistante justifie un avis rapide.",
        ],
      },
      {
        h: "Mal de dos, lombalgie et sciatique",
        body: [
          "Le mal de dos est l'un des motifs de consultation les plus fréquents. La plupart des lombalgies sont bénignes et mécaniques, mais certaines cachent une cause inflammatoire ou une hernie discale comprimant un nerf (sciatique).",
          "Le rhumatologue distingue ces causes, soulage la douleur et prescrit la rééducation adaptée. Une douleur nocturne, une fièvre, un amaigrissement ou un déficit neurologique imposent un bilan sans attendre.",
        ],
      },
      {
        h: "Ostéoporose : dépistage après la ménopause",
        body: [
          "L'ostéoporose fragilise silencieusement les os et expose aux fractures (poignet, vertèbres, hanche), surtout chez la femme après la ménopause. Elle ne provoque aucun symptôme avant la première fracture.",
          "La densitométrie osseuse mesure la solidité des os et guide la prévention (calcium, vitamine D, activité physique) et, si besoin, un traitement. Un dépistage est recommandé après 65 ans ou plus tôt en cas de facteurs de risque.",
        ],
      },
      {
        h: "Rhumatologie de l'enfant et du sportif",
        body: [
          "La rhumatologie ne concerne pas seulement les personnes âgées. Chez l'enfant, certaines douleurs articulaires persistantes, boiteries ou gonflements peuvent révéler une arthrite juvénile qui nécessite une prise en charge spécialisée précoce. Chez l'adolescent et l'adulte jeune, des douleurs du dos ou du talon durables et à recrudescence nocturne doivent faire évoquer une spondyloarthrite, souvent sous-diagnostiquée au Maroc pendant plusieurs années.",
          "Chez le sportif, amateur comme confirmé, le rhumatologue prend en charge les tendinites, les douleurs de genou, d'épaule ou de hanche liées à la pratique, ainsi que les suites de microtraumatismes répétés. Il travaille en lien avec le kinésithérapeute et, si besoin, le médecin du sport ou l'orthopédiste. L'objectif est de traiter la douleur, corriger les gestes et le matériel, et permettre une reprise progressive sans aggraver la lésion.",
        ],
      },
      {
        h: "Vivre avec une maladie rhumatismale chronique au Maroc",
        body: [
          "De nombreux rhumatismes évoluent au long cours et demandent un suivi régulier plutôt qu'un traitement ponctuel. Le rhumatologue adapte les traitements dans le temps, surveille leur tolérance par des bilans et coordonne le parcours avec le médecin traitant, le kinésithérapeute et parfois d'autres spécialistes. Pour les maladies inflammatoires nécessitant des biothérapies, un suivi rapproché et un dossier de prise en charge auprès de votre organisme d'assurance (CNSS, CNOPS) sont souvent indispensables.",
          "Au quotidien, l'activité physique adaptée, la gestion du poids, l'arrêt du tabac et l'aménagement des gestes du travail comme du domicile jouent un rôle majeur pour limiter les douleurs et préserver l'autonomie. N'interrompez jamais un traitement de fond sans avis médical, même si les douleurs disparaissent. En cas de poussée sévère, de fièvre inexpliquée ou d'articulation brutalement inflammatoire, contactez votre rhumatologue ou, en cas d'urgence, le 15 (SAMU).",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un rhumatologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Radiographie", value: "150 – 350 MAD" },
        { label: "Densitométrie osseuse (ostéoporose)", value: "300 – 700 MAD" },
        { label: "Infiltration articulaire", value: "300 – 800 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "traumatologie-orthopedie": {
    synonyme: "orthopédiste",
    reviewed: "2026-07-05",
    description:
      "L'orthopédiste (ou chirurgien orthopédiste) est le spécialiste de l'appareil locomoteur : os, articulations, tendons, ligaments et muscles. Il prend en charge les fractures, entorses, arthroses, hernies discales, scolioses et maladies dégénératives articulaires. La chirurgie orthopédique inclut la pose de prothèses de hanche et de genou, la chirurgie du rachis et l'arthroscopie. Au Maroc, les traumatismes liés aux accidents de la route font de l'orthopédie l'une des spécialités les plus sollicitées.",
    quandConsulter: [
      "Douleurs articulaires persistantes (genou, hanche, épaule)",
      "Fracture ou traumatisme osseux",
      "Entorse grave ou rupture ligamentaire",
      "Hernie discale ou lombalgie chronique",
      "Déformation articulaire ou trouble de la marche",
    ],
    faqs: [
      {
        q: "Quelle différence entre rhumatologue et orthopédiste ?",
        a: "Le rhumatologue traite les maladies inflammatoires articulaires (polyarthrite, goutte) de manière médicale. L'orthopédiste intervient chirurgicalement sur les pathologies mécaniques et les traumatismes de l'appareil locomoteur.",
      },
      {
        q: "Combien coûte une consultation chez un orthopédiste au Maroc ?",
        a: "Une consultation orthopédique coûte entre 300 et 600 MAD au Maroc. Les actes chirurgicaux font l'objet d'une prise en charge hospitalière distincte.",
      },
      {
        q: "Quand faut-il consulter un orthopédiste en urgence ?",
        a: "Consultez en urgence en cas de fracture suspectée, de déformation articulaire brutale, de douleur intense après une chute, ou si une articulation ne peut plus supporter de poids.",
      },
      {
        q: "Comment prendre rendez-vous avec un orthopédiste ?",
        a: "Sur SantéauMaroc, trouvez un orthopédiste disponible dans votre ville et réservez en ligne. Pour les urgences traumatologiques, rendez-vous directement aux urgences hospitalières.",
      },
      { q: "Faut-il une lettre d'orientation du médecin traitant pour consulter un orthopédiste ?", a: "Au Maroc, vous pouvez généralement consulter un orthopédiste en accès direct dans le secteur privé, sans passer par un médecin traitant. Dans le secteur public, un passage par le centre de santé ou les urgences oriente souvent vers la consultation spécialisée. Pour le remboursement AMO, conservez tous vos justificatifs et prescriptions." },
      { q: "L'orthopédie et le sport : quand consulter après une blessure sportive ?", a: "Consultez un orthopédiste si une entorse, une déchirure musculaire ou une douleur articulaire persiste au-delà de quelques jours malgré le repos, la glace et l'immobilisation. Une impossibilité de poser le pied, une articulation instable ou un gonflement important doivent amener à consulter rapidement. En cas de traumatisme violent avec déformation, dirigez-vous vers les urgences (15 SAMU)." },
      { q: "Comment se préparer à une intervention orthopédique programmée ?", a: "Un bilan préopératoire est demandé : analyses de sang, bilan cardiaque et consultation d'anesthésie sont habituels. Signalez tous vos traitements, notamment les anticoagulants, souvent à adapter avant l'opération. Organisez à l'avance votre retour à domicile et le matériel éventuel (béquilles, attelle) pour faciliter la convalescence." },
      { q: "La chirurgie orthopédique est-elle prise en charge par la CNSS ou l'AMO ?", a: "Les interventions orthopédiques reconnues sont prises en charge partiellement par l'AMO (CNSS ou secteur public) selon la Tarification Nationale de Référence de l'ANAM. Le remboursement porte sur une base conventionnée, et un reste à charge subsiste souvent dans le privé où les honoraires sont libres. Demandez un devis détaillé et vérifiez votre couverture complémentaire avant l'hospitalisation." },
      { q: "Combien de temps dure la rééducation après une opération de l'épaule ou du genou ?", a: "La rééducation dépend de l'intervention et de votre état, allant généralement de quelques semaines à plusieurs mois. Les séances de kinésithérapie, prescrites par l'orthopédiste, sont essentielles pour retrouver mobilité et force. Le respect du protocole et l'assiduité aux séances conditionnent largement la qualité du résultat final." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Os & articulations", label: "Champ de la spécialité" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Fractures et traumatismes : que faire ?",
        body: [
          "Au Maroc, les accidents de la route et les chutes font des traumatismes osseux un motif très fréquent. Devant une déformation, une douleur intense ou l'impossibilité de bouger un membre après un choc, rendez-vous aux urgences.",
          "L'orthopédiste prend ensuite le relais pour la consolidation : plâtre, attelle ou chirurgie selon la fracture, puis suivi de la rééducation jusqu'à la récupération.",
        ],
      },
      {
        h: "Arthrose et douleurs articulaires chroniques",
        body: [
          "L'arthrose use progressivement le cartilage des articulations (genou, hanche, épaule) et provoque douleurs et raideur, surtout avec l'âge ou après un traumatisme.",
          "L'orthopédiste évalue le stade, propose des traitements conservateurs (rééducation, infiltrations) et, lorsque la gêne devient invalidante, envisage la chirurgie.",
        ],
      },
      {
        h: "Prothèses de hanche et de genou",
        body: [
          "Lorsque l'arthrose est avancée et le handicap important, la pose d'une prothèse de hanche ou de genou redonne une mobilité indolore. C'est une chirurgie courante et bien maîtrisée au Maroc.",
          "L'intervention est suivie d'une rééducation essentielle à la récupération. L'orthopédiste évalue le bon moment en fonction de la douleur et du retentissement sur la vie quotidienne.",
        ],
      },
      {
        h: "Rhumatologue ou orthopédiste : qui consulter ?",
        body: [
          "Le rhumatologue traite médicalement les maladies inflammatoires des articulations (polyarthrite, goutte). L'orthopédiste intervient sur les pathologies mécaniques et les traumatismes, avec un recours possible à la chirurgie.",
          "En cas de doute, le médecin généraliste oriente vers le bon spécialiste. Une douleur articulaire persistante justifie toujours un avis pour éviter l'aggravation.",
        ],
      },
      {
        h: "Le suivi postopératoire et la rééducation après une chirurgie orthopédique",
        body: [
          "Après une intervention orthopédique, le suivi ne s'arrête pas à la sortie du bloc opératoire. L'orthopédiste programme des consultations de contrôle pour surveiller la cicatrisation, vérifier la bonne consolidation osseuse par radiographie et ajuster le traitement antalgique. Le respect des consignes concernant l'appui, le port d'attelle ou l'usage de béquilles est déterminant pour éviter les complications. Au Maroc, ce suivi s'organise aussi bien dans le secteur privé que dans les hôpitaux publics, selon votre couverture et le lieu de l'opération.",
          "La rééducation, confiée à un kinésithérapeute sur prescription de l'orthopédiste, constitue une étape à part entière de la guérison. Elle vise à récupérer l'amplitude des mouvements, renforcer les muscles et retrouver l'autonomie dans les gestes du quotidien. L'assiduité aux séances et la pratique des exercices à domicile influencent fortement le résultat final. Un accompagnement bien conduit réduit le risque de raideur articulaire et accélère le retour aux activités habituelles.",
        ],
      },
      {
        h: "Orthopédie pédiatrique : le suivi de la croissance de l'enfant",
        body: [
          "L'orthopédie pédiatrique s'intéresse aux troubles de l'appareil locomoteur chez l'enfant, dont beaucoup sont liés à la croissance. Les motifs de consultation fréquents au Maroc incluent la marche sur la pointe des pieds, les pieds plats, les jambes arquées ou en X, ainsi que le dépistage d'une scoliose à l'adolescence. Certains de ces aspects sont physiologiques et se corrigent spontanément avec l'âge, tandis que d'autres nécessitent une surveillance rapprochée ou un traitement.",
          "Un dépistage précoce permet d'éviter que certaines anomalies ne s'aggravent une fois la croissance terminée. La luxation congénitale de la hanche, par exemple, est recherchée dès les premiers mois de vie car sa prise en charge précoce est bien plus simple. En cas de doute sur la posture, la démarche ou une asymétrie du dos de votre enfant, une consultation orthopédique permet d'établir un diagnostic et, si besoin, d'orienter vers un suivi adapté ou de la kinésithérapie.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un orthopédiste au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens et la chirurgie sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Radiographie", value: "150 – 350 MAD" },
        { label: "Infiltration articulaire", value: "300 – 800 MAD" },
        { label: "Prothèse de hanche ou de genou (clinique)", value: "25 000 – 60 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026), hors prise en charge. Les assurés CNSS et AMO bénéficient d'un remboursement partiel des actes sur dossier.",
    },
  },

  "psychiatrie": {
    synonyme: "psychiatre",
    reviewed: "2026-07-05",
    description:
      "Le psychiatre est le médecin spécialiste des troubles mentaux et du comportement. Il diagnostique et traite la dépression, les troubles anxieux, le trouble bipolaire, la schizophrénie, les addictions et les troubles de la personnalité. En tant que médecin, il peut prescrire des médicaments (antidépresseurs, anxiolytiques, antipsychotiques) et propose également des thérapies. Au Maroc, la santé mentale reste un domaine sous-représenté malgré une demande croissante — consulter un psychiatre est un acte courageux et bénéfique.",
    quandConsulter: [
      "Dépression, tristesse profonde ou perte de sens",
      "Anxiété sévère ou attaques de panique",
      "Troubles du sommeil persistants",
      "Conduites addictives (alcool, substances, jeux)",
      "Pensées intrusives ou comportements répétitifs",
    ],
    faqs: [
      {
        q: "Quelle différence entre psychiatre et psychologue ?",
        a: "Le psychiatre est un médecin qui peut prescrire des médicaments en plus des thérapies. Le psychologue, non-médecin, se concentre sur les thérapies comportementales et cognitives sans prescription médicale.",
      },
      {
        q: "Combien coûte une consultation chez un psychiatre au Maroc ?",
        a: "Une séance chez un psychiatre coûte entre 300 et 600 MAD au Maroc. La CNSS et l'AMO remboursent partiellement les consultations psychiatriques sur prescription.",
      },
      {
        q: "La consultation psychiatrique est-elle confidentielle ?",
        a: "Oui, la confidentialité médicale est garantie. Les informations partagées avec votre psychiatre ne sont communiquées à personne sans votre consentement, sauf cas d'urgence légale.",
      },
      {
        q: "Comment trouver un psychiatre au Maroc ?",
        a: "SantéauMaroc répertorie les psychiatres disponibles avec leurs avis et tarifs. La prise de rendez-vous est discrète et gratuite en ligne.",
      },
      { q: "Faut-il une ordonnance ou une lettre du médecin traitant pour consulter un psychiatre au Maroc ?", a: "Non, le psychiatre est en accès direct au Maroc : vous pouvez le consulter sans passer par un médecin généraliste. Une lettre d'orientation reste utile si votre médecin traitant suit déjà votre situation, car elle facilite la transmission de vos antécédents. Pour un premier rendez-vous, il suffit de prendre contact avec le cabinet." },
      { q: "Les médicaments psychiatriques (antidépresseurs, anxiolytiques) sont-ils remboursés par la CNSS ou l'AMO ?", a: "Une partie des psychotropes figure sur les listes de médicaments remboursables de l'AMO, sur la base du tarif de référence fixé par l'ANAM. Le remboursement suppose une prescription et le respect du circuit habituel (feuille de soins ou pharmacie conventionnée). Certaines molécules récentes ou de confort restent à votre charge : demandez au psychiatre et au pharmacien ce qui est pris en charge dans votre situation." },
      { q: "Les antidépresseurs rendent-ils dépendant et peut-on les arrêter seul ?", a: "Les antidépresseurs ne provoquent pas de dépendance au sens des drogues, mais un arrêt brutal peut entraîner un syndrome de sevrage inconfortable. Il ne faut jamais les stopper seul : la diminution se fait progressivement, selon un calendrier décidé avec le psychiatre. Les anxiolytiques de la famille des benzodiazépines, eux, exposent à une accoutumance et sont prescrits pour de courtes durées." },
      { q: "Que faire en cas de crise ou de pensées suicidaires en dehors des heures de cabinet ?", a: "Face à un danger immédiat pour soi ou pour autrui, appelez sans attendre le 15 (SAMU) ou rendez-vous aux urgences de l'hôpital le plus proche, qui disposent d'une prise en charge psychiatrique. N'attendez pas le prochain rendez-vous. Vous pouvez aussi contacter un proche de confiance pour ne pas rester seul le temps d'obtenir de l'aide." },
      { q: "Le psychiatre peut-il établir un certificat pour un arrêt de travail ou un dossier administratif ?", a: "Oui, le psychiatre peut délivrer un certificat médical ou un arrêt de travail lorsque l'état de santé le justifie, recevable auprès de l'employeur et de la CNSS. Pour les situations complexes (invalidité, dossier auprès d'un organisme), il peut rédiger un rapport détaillé. Précisez l'usage prévu dès la consultation afin que le document soit adapté." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une séance" },
      { value: "Médecin", label: "Peut prescrire un traitement" },
      { value: "Confidentiel", label: "Secret médical garanti" },
    ],
    sections: [
      {
        h: "Psychiatre ou psychologue : quelle différence ?",
        body: [
          "Le psychiatre est un médecin : il diagnostique les troubles mentaux et peut prescrire des médicaments, en plus de proposer des thérapies. Le psychologue, non-médecin, se concentre sur l'accompagnement et les thérapies sans prescription.",
          "Les deux sont complémentaires. Le choix dépend de la situation ; en cas de doute, le médecin généraliste oriente vers le professionnel le plus adapté.",
        ],
      },
      {
        h: "Dépression et troubles anxieux : des maladies qui se soignent",
        body: [
          "La dépression et les troubles anxieux ne sont pas une faiblesse de caractère mais de véritables maladies, fréquentes et bien prises en charge aujourd'hui.",
          "Tristesse profonde durable, perte d'intérêt, troubles du sommeil, anxiété envahissante ou idées noires justifient de consulter. Plus la prise en charge est précoce, meilleure est la récupération.",
        ],
      },
      {
        h: "Lever le tabou de la santé mentale au Maroc",
        body: [
          "La santé mentale reste entourée de tabous au Maroc, alors que la demande de soins augmente. Consulter un psychiatre est un acte de soin responsable, au même titre que pour toute autre maladie.",
          "Demander de l'aide tôt évite l'aggravation et la chronicisation. Personne ne devrait souffrir en silence par crainte du regard des autres.",
        ],
      },
      {
        h: "Confidentialité et déroulement d'une consultation",
        body: [
          "La consultation psychiatrique est strictement confidentielle : les informations partagées sont protégées par le secret médical et ne sont communiquées à personne sans votre consentement.",
          "La première séance vise à comprendre votre situation. Le psychiatre propose ensuite un suivi adapté : thérapie, traitement, ou les deux, en vous expliquant chaque étape.",
        ],
      },
      {
        h: "Quand consulter un psychiatre : les signaux qui doivent alerter",
        body: [
          "Certains signes justifient de prendre rendez-vous sans attendre : une tristesse ou une angoisse qui dure plusieurs semaines, des troubles du sommeil persistants, une perte d'intérêt pour les activités habituelles, une irritabilité inhabituelle, ou des difficultés à assurer son travail et sa vie quotidienne. Chez certaines personnes, les symptômes se manifestent d'abord par le corps : fatigue inexpliquée, palpitations, douleurs diffuses ou troubles digestifs pour lesquels les examens ne trouvent rien. Consulter tôt permet souvent un traitement plus court et plus efficace.",
          "Il ne faut jamais banaliser des pensées de mort, une consommation d'alcool ou de substances qui augmente, des idées qui semblent déconnectées de la réalité, ou un comportement qui inquiète l'entourage. En cas de danger immédiat, le 15 (SAMU) et les urgences hospitalières prennent le relais à toute heure. Pour les situations non urgentes, un psychiatre référencé sur SantéauMaroc peut poser un diagnostic et proposer une prise en charge adaptée, seul ou en lien avec un psychologue et le médecin traitant.",
        ],
      },
      {
        h: "Soins psychiatriques au Maroc : secteur public et secteur privé",
        body: [
          "Au Maroc, la prise en charge en santé mentale s'organise entre un secteur public (centres hospitaliers universitaires, hôpitaux régionaux et services psychiatriques spécialisés) et un secteur privé de cabinets et de cliniques. Le secteur public reste la voie principale pour les hospitalisations et les situations lourdes, avec des coûts limités mais parfois des délais d'attente. Le secteur privé offre des rendez-vous plus rapides et un suivi de proximité, avec des honoraires libres qui varient selon la ville et l'expérience du praticien.",
          "Le choix dépend de la nature du trouble, de l'urgence et de votre couverture. Les assurés CNSS ou AMO peuvent obtenir un remboursement partiel des consultations et de certains médicaments, selon le tarif de référence de l'ANAM. Beaucoup de patients combinent les deux circuits : un suivi régulier en cabinet privé et le recours à l'hôpital public en cas de crise. SantéauMaroc vous aide à repérer les psychiatres près de chez vous et à comparer disponibilités, langues parlées et conventionnement.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un psychiatre au Maroc ?",
      intro:
        "Les honoraires sont libres et varient selon la ville, le praticien et la durée de la séance. Fourchettes indicatives.",
      rows: [
        { label: "Première consultation", value: "350 – 700 MAD" },
        { label: "Séance de suivi", value: "300 – 600 MAD" },
        { label: "Consultation en clinique privée", value: "400 – 800 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des consultations psychiatriques sur prescription.",
    },
  },

  "chirurgie-dentaire": {
    synonyme: "chirurgien-dentiste",
    reviewed: "2026-07-05",
    synonymePluriel: "chirurgiens-dentistes",
    description:
      "Le chirurgien-dentiste est le spécialiste de la santé bucco-dentaire. Il diagnostique et traite les caries, les maladies des gencives (gingivite, parodontite), les infections dentaires et les anomalies de l'occlusion. Son champ couvre les soins courants — détartrage, traitement des caries, dévitalisation — comme les actes prothétiques et chirurgicaux : couronnes, bridges, prothèses, extractions et pose d'implants. Au Maroc, la santé dentaire reste un motif de consultation très fréquent et l'offre de cabinets est dense dans les grandes villes. Une visite de contrôle une à deux fois par an, associée à un détartrage, permet de prévenir la majorité des pathologies et d'éviter des soins lourds et coûteux. Le chirurgien-dentiste joue aussi un rôle de dépistage : il repère précocement les lésions de la muqueuse buccale et oriente vers un spécialiste si nécessaire. Pour les enfants, un suivi régulier accompagne la croissance des dents et prévient les caries du jeune âge.",
    quandConsulter: [
      "Douleur dentaire, sensibilité au chaud ou au froid",
      "Saignement ou gonflement des gencives",
      "Contrôle annuel et détartrage",
      "Dent cassée, déchaussée ou abcès",
      "Besoin de prothèse, couronne ou implant",
    ],
    faqs: [
      {
        q: "À quelle fréquence consulter un chirurgien-dentiste ?",
        a: "Une visite de contrôle tous les 6 à 12 mois est recommandée, même sans douleur, afin de dépister précocement les caries et les maladies des gencives. Un détartrage annuel est conseillé pour la plupart des adultes.",
      },
      {
        q: "Combien coûte une consultation chez un dentiste au Maroc ?",
        a: "Une consultation simple coûte généralement entre 100 et 250 MAD, un détartrage entre 200 et 500 MAD, et le soin d'une carie entre 150 et 400 MAD selon la ville et le cabinet. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
      },
      {
        q: "Le détartrage abîme-t-il les dents ?",
        a: "Non, le détartrage retire la plaque et le tartre sans endommager l'émail. C'est un acte préventif qui protège les gencives et évite le déchaussement des dents. Une légère sensibilité passagère est possible dans les jours qui suivent.",
      },
      {
        q: "Comment prendre rendez-vous avec un dentiste au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Chirurgie dentaire » et sélectionnez votre ville. Consultez les profils vérifiés, les avis patients et les disponibilités, puis réservez en ligne gratuitement.",
      },
      { q: "Une extraction de dent de sagesse est-elle toujours nécessaire ?", a: "Non, une dent de sagesse qui a fait sa place et ne provoque ni douleur, ni infection ni gêne pour les dents voisines peut être conservée sous surveillance. L'extraction est envisagée quand la dent est incluse, mal positionnée, source de caries ou d'infections répétées (péricoronarite). Le chirurgien-dentiste s'appuie sur un examen clinique et une radio panoramique pour décider, et oriente parfois vers un stomatologue au Maroc pour les cas complexes." },
      { q: "Que faire en cas de rage de dents ou d'abcès dentaire ?", a: "Une douleur dentaire intense ou un gonflement du visage impose une consultation dentaire rapide, car il peut s'agir d'un abcès à traiter sans tarder. En attendant, un antalgique simple peut soulager, mais il ne remplace pas les soins. Si le gonflement s'étend au cou, gêne la respiration ou la déglutition, ou s'accompagne de fièvre élevée, il faut se rendre aux urgences ou appeler le 15 (SAMU) : une infection dentaire négligée peut se compliquer." },
      { q: "Un dentiste peut-il soigner une femme enceinte ?", a: "Oui, les soins dentaires courants sont possibles pendant la grossesse et même recommandés, car les gencives sont plus fragiles à cette période. Le deuxième trimestre est souvent le plus confortable pour les soins programmés. Il est important de signaler la grossesse au chirurgien-dentiste, qui adapte les anesthésiques, évite certains médicaments et reporte les radiographies non urgentes." },
      { q: "L'orthodontie est-elle réservée aux enfants ?", a: "Non, un traitement orthodontique (appareil dentaire) peut être réalisé à tout âge tant que les gencives et l'os sont sains, et de nombreux adultes y ont recours au Maroc. Le premier bilan orthodontique de l'enfant est toutefois conseillé vers 7 ans pour dépister à temps les décalages des mâchoires. Selon la complexité, le chirurgien-dentiste peut orienter vers un orthodontiste." },
      { q: "Comment garder une haleine fraîche au quotidien ?", a: "La mauvaise haleine vient le plus souvent d'un dépôt bactérien sur les dents et la langue, ou d'une gencive enflammée ; un brossage soigneux deux fois par jour, le nettoyage de la langue et le fil dentaire suffisent souvent à l'améliorer. Un détartrage régulier et le traitement des caries aident également. Si l'haleine reste gênante malgré une bonne hygiène, une consultation permet d'en rechercher la cause, parfois digestive ou ORL." },
    ],
    essentiel: [
      { value: "100 – 250 MAD", label: "Tarif d'une consultation" },
      { value: "1 à 2 / an", label: "Visites de contrôle conseillées" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Soins dentaires courants : détartrage, caries et dévitalisation",
        body: [
          "La majorité des actes réalisés au cabinet sont des soins courants : détartrage pour éliminer la plaque, traitement des caries par obturation (plombage ou composite) et dévitalisation lorsque la carie a atteint le nerf. Pris à temps, ces soins sont simples et peu coûteux.",
          "Négligés, ils évoluent vers l'abcès, la perte de la dent et des traitements plus lourds. Un contrôle régulier reste la meilleure protection, en particulier pour les personnes diabétiques chez qui les infections gingivales sont plus fréquentes.",
        ],
      },
      {
        h: "Prothèses, couronnes et implants dentaires",
        body: [
          "Lorsqu'une dent est trop abîmée ou absente, le chirurgien-dentiste propose une solution prothétique : couronne pour reconstituer une dent dévitalisée, bridge ou prothèse amovible pour remplacer plusieurs dents, ou implant fixé dans l'os pour une solution durable.",
          "Le choix dépend de l'état de la mâchoire, du nombre de dents à remplacer et du budget. L'implantologie demande un bilan préalable (radiographie, parfois scanner) pour vérifier la qualité osseuse.",
        ],
      },
      {
        h: "Soins dentaires de l'enfant",
        body: [
          "Le suivi dentaire de l'enfant commence dès l'apparition des premières dents. Le dentiste surveille la croissance, applique des vernis fluorés et traite précocement les caries du lait, qui peuvent affecter les dents définitives.",
          "Il repère aussi les troubles de l'occlusion et oriente, le cas échéant, vers un orthodontiste pour un traitement d'alignement au bon moment.",
        ],
      },
      {
        h: "Remboursement des soins dentaires : CNSS et AMO",
        body: [
          "Les soins dentaires de base et certaines prothèses sont partiellement pris en charge par la CNSS et l'AMO, sur présentation de la feuille de soins et du devis. Les actes esthétiques (blanchiment, facettes) ne sont généralement pas remboursés.",
          "Demandez systématiquement un devis détaillé avant un traitement prothétique ou implantaire : il est indispensable pour votre dossier de remboursement et pour comparer les cabinets.",
        ],
      },
      {
        h: "Prévenir les problèmes dentaires : hygiène et alimentation",
        body: [
          "La grande majorité des problèmes dentaires courants au Maroc, caries et maladies des gencives, peuvent être évités par des gestes simples et réguliers. Un brossage de deux minutes matin et soir avec un dentifrice fluoré, complété par le fil dentaire ou les brossettes pour nettoyer entre les dents, retire la plaque bactérienne responsable des caries et de l'inflammation gingivale. Le remplacement de la brosse tous les trois mois environ et un brossage doux préservent aussi bien les dents que les gencives.",
          "L'alimentation joue un rôle déterminant : la fréquence des prises de sucre, plus encore que la quantité, favorise les caries, notamment via les boissons sucrées et le grignotage entre les repas. Boire de l'eau, limiter le thé très sucré et rincer la bouche après un aliment acide sont des habitudes protectrices. Une visite de contrôle régulière chez le chirurgien-dentiste permet de détecter tôt une lésion débutante et d'éviter des soins plus lourds et plus coûteux par la suite.",
        ],
      },
      {
        h: "Gérer la peur du dentiste et vivre le rendez-vous sereinement",
        body: [
          "La peur du dentiste est fréquente et ne doit pas conduire à repousser les soins, car un problème négligé devient souvent plus douloureux et plus difficile à traiter. En parler ouvertement au praticien change beaucoup de choses : le chirurgien-dentiste peut expliquer chaque étape, convenir d'un signe pour faire une pause et proposer une anesthésie locale efficace afin que les soins soient indolores. Choisir un rendez-vous à un moment calme de la journée aide aussi à aborder la séance plus détendu.",
          "Une bonne préparation contribue à un rendez-vous serein : noter à l'avance ses questions et ses gênes, apporter la liste de ses traitements en cours et signaler toute allergie ou maladie chronique permet au praticien d'adapter sa prise en charge. Après certains soins, quelques précautions simples, comme éviter de manger tant que l'anesthésie n'est pas dissipée, favorisent une bonne récupération. En cas de douleur inhabituelle ou de saignement prolongé après une intervention, il ne faut pas hésiter à recontacter son chirurgien-dentiste.",
        ],
      },
    ],
    prix: {
      title: "Combien coûtent les soins dentaires au Maroc ?",
      intro:
        "Les honoraires sont libres au Maroc et varient selon la ville, le cabinet et la complexité de l'acte. Voici des fourchettes indicatives constatées.",
      rows: [
        { label: "Consultation simple", value: "100 – 250 MAD" },
        { label: "Détartrage", value: "200 – 500 MAD" },
        { label: "Traitement d'une carie", value: "150 – 400 MAD" },
        { label: "Dévitalisation (traitement de canal)", value: "400 – 1 200 MAD" },
        { label: "Couronne céramique", value: "1 500 – 3 500 MAD" },
        { label: "Implant dentaire", value: "5 000 – 12 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des soins de base sur présentation de l'ordonnance et du devis.",
    },
  },

  "chirurgie-generale": {
    synonyme: "chirurgien généraliste",
    reviewed: "2026-07-05",
    description:
      "Le chirurgien généraliste (ou chirurgien viscéral et digestif) prend en charge chirurgicalement les pathologies de l'abdomen et des tissus mous. Il traite l'appendicite, les hernies (inguinale, ombilicale), les calculs et maladies de la vésicule biliaire, les pathologies du tube digestif, ainsi que de nombreuses urgences abdominales. La chirurgie moderne privilégie au Maroc les techniques mini-invasives (cœlioscopie), qui réduisent la douleur et la durée d'hospitalisation. La consultation de chirurgie générale fait le plus souvent suite à une orientation par le médecin généraliste, le gastro-entérologue ou les urgences, après un bilan (échographie, scanner, analyses). Le chirurgien évalue l'indication opératoire, explique le geste, ses bénéfices et ses risques, et organise la consultation pré-anesthésique obligatoire avant toute intervention programmée. Il assure également le suivi post-opératoire et la cicatrisation. Devant une douleur abdominale aiguë et intense, une consultation rapide s'impose pour éliminer une urgence chirurgicale.",
    quandConsulter: [
      "Hernie de l'aine ou de l'abdomen",
      "Crises de coliques hépatiques (calculs de la vésicule)",
      "Douleur abdominale aiguë (suspicion d'appendicite)",
      "Bilan avant une intervention chirurgicale",
      "Suivi post-opératoire et cicatrisation",
    ],
    faqs: [
      {
        q: "Quand faut-il consulter un chirurgien généraliste ?",
        a: "On consulte généralement sur orientation du médecin traitant, du gastro-entérologue ou des urgences, lorsqu'une pathologie nécessite un avis chirurgical : hernie, calculs vésiculaires, appendicite ou autre affection de l'abdomen.",
      },
      {
        q: "Combien coûte une consultation de chirurgie générale au Maroc ?",
        a: "Une consultation coûte généralement entre 250 et 500 MAD selon la ville et le praticien. Le coût d'une intervention dépend de l'acte, de la clinique et de la durée d'hospitalisation ; les assurés CNSS ou AMO bénéficient d'une prise en charge partielle sur dossier.",
      },
      {
        q: "Qu'est-ce que la cœlioscopie ?",
        a: "La cœlioscopie est une technique mini-invasive : le chirurgien opère à travers de petites incisions à l'aide d'une caméra. Elle réduit la douleur, les cicatrices et la durée d'hospitalisation par rapport à la chirurgie ouverte, lorsqu'elle est indiquée.",
      },
      {
        q: "Comment prendre rendez-vous avec un chirurgien au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Chirurgie générale » et votre ville pour trouver un chirurgien disponible, consulter ses avis patients vérifiés et réserver une consultation en ligne gratuitement.",
      },
      { q: "Quelle est la différence entre un chirurgien généraliste et un chirurgien viscéral ou digestif ?", a: "Au Maroc, le chirurgien généraliste prend en charge un large éventail d'interventions de la paroi abdominale et des organes digestifs (hernies, vésicule, appendice, thyroïde, sein). Le chirurgien viscéral et digestif est un surspécialiste qui se concentre sur les organes du tube digestif et les cancers digestifs complexes. Pour un problème simple, le généraliste suffit ; les cas lourds sont souvent orientés vers un centre disposant d'un plateau spécialisé." },
      { q: "Faut-il obligatoirement une lettre d'orientation du médecin traitant pour voir un chirurgien ?", a: "Non, dans le secteur privé marocain vous pouvez consulter directement un chirurgien généraliste sans lettre. Toutefois, apporter un courrier de votre médecin généraliste et vos examens récents (échographie, scanner, bilan sanguin) fait gagner du temps et évite des examens en double. Dans le secteur public, le passage par un centre de santé ou le service des urgences est généralement la porte d'entrée." },
      { q: "Combien de temps dure l'hospitalisation après une opération courante ?", a: "Cela dépend de l'intervention et de la technique. Une cure de hernie ou une ablation de vésicule par cœlioscopie se fait souvent en ambulatoire ou avec une seule nuit à la clinique. Une chirurgie ouverte ou plus lourde peut nécessiter plusieurs jours. Votre chirurgien vous précise la durée prévisible lors de la consultation, mais elle peut être prolongée en cas de suites particulières." },
      { q: "Quand puis-je reprendre le travail et le sport après une intervention chirurgicale ?", a: "Après une cœlioscopie simple, une reprise d'activité légère est souvent possible en une à deux semaines, tandis que le port de charges lourdes et le sport sont à éviter plusieurs semaines. Après une chirurgie ouverte, la convalescence est plus longue. Respectez strictement les consignes de votre chirurgien : une reprise trop précoce augmente le risque de complications comme une éventration." },
      { q: "Que faire en cas de fièvre, de rougeur ou d'écoulement au niveau de la cicatrice après l'opération ?", a: "Ces signes peuvent évoquer une infection de la plaie et doivent amener à recontacter rapidement votre chirurgien ou la clinique où vous avez été opéré. En cas de fièvre élevée, de douleur abdominale intense, de vomissements ou de malaise, il s'agit d'une urgence : rendez-vous aux urgences ou appelez le 15 (SAMU). N'attendez pas et ne modifiez pas seul votre traitement." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Cœlioscopie", label: "Techniques mini-invasives" },
      { value: "Sur orientation", label: "Après bilan médical" },
    ],
    sections: [
      {
        h: "Hernies, vésicule, appendicite : les interventions les plus fréquentes",
        body: [
          "Les motifs les plus courants de chirurgie générale sont la cure de hernie (renforcement de la paroi, souvent par plaque), l'ablation de la vésicule biliaire en cas de calculs symptomatiques (cholécystectomie) et l'appendicectomie en urgence.",
          "La plupart de ces interventions sont aujourd'hui réalisées par cœlioscopie au Maroc, ce qui permet une récupération plus rapide et un retour précoce aux activités.",
        ],
      },
      {
        h: "Avant l'opération : bilan et consultation pré-anesthésique",
        body: [
          "Toute intervention programmée est précédée d'un bilan (analyses, imagerie) et d'une consultation pré-anesthésique obligatoire avec l'anesthésiste-réanimateur, qui évalue le risque et choisit le type d'anesthésie.",
          "Le chirurgien explique le déroulé de l'opération, ses bénéfices, ses risques et les suites attendues. C'est le moment de poser toutes vos questions et de recueillir un devis détaillé.",
        ],
      },
      {
        h: "Reconnaître une urgence chirurgicale abdominale",
        body: [
          "Une douleur abdominale intense et brutale, surtout si elle s'accompagne de fièvre, de vomissements, d'un ventre dur ou de l'arrêt des gaz et des selles, peut signaler une urgence (appendicite, occlusion, péritonite).",
          "Dans ce cas, ne tardez pas : rendez-vous aux urgences hospitalières. Un diagnostic et une prise en charge rapides limitent les complications.",
        ],
      },
      {
        h: "Prise en charge et remboursement d'une intervention",
        body: [
          "Le coût d'une intervention regroupe les honoraires du chirurgien, ceux de l'anesthésiste et les frais de clinique (bloc, hospitalisation). Il varie fortement selon l'établissement et la complexité du geste.",
          "Les assurés CNSS et AMO bénéficient d'une prise en charge partielle, à constituer avant l'hospitalisation à partir du devis et des comptes rendus. Vérifiez les conditions auprès de votre organisme et de votre mutuelle complémentaire.",
        ],
      },
      {
        h: "Chirurgie ambulatoire et cœlioscopie : vers des séjours plus courts",
        body: [
          "De plus en plus d'interventions de chirurgie générale se pratiquent au Maroc en ambulatoire, c'est-à-dire avec une entrée et une sortie le jour même, sans nuit à la clinique. Cette organisation, rendue possible par les techniques mini-invasives comme la cœlioscopie, concerne notamment certaines cures de hernie et ablations de vésicule chez des patients en bon état général. Elle réduit la durée d'immobilisation et le risque d'infection lié à un séjour prolongé.",
          "L'ambulatoire n'est proposé que si votre état de santé, votre entourage et votre lieu de résidence le permettent : vous devez pouvoir être raccompagné, surveillé la première nuit et joindre facilement l'équipe en cas de problème. Le chirurgien et l'anesthésiste évaluent ensemble votre éligibilité lors de la consultation. En cas de doute, une hospitalisation classique reste toujours privilégiée pour votre sécurité.",
        ],
      },
      {
        h: "Après l'opération : cicatrisation, douleur et signes à surveiller",
        body: [
          "La période qui suit l'intervention est aussi importante que le geste chirurgical lui-même. Votre chirurgien vous remet des consignes sur les soins de la cicatrice, la reprise de l'alimentation, la mobilisation précoce et le traitement contre la douleur. Une gêne modérée est normale les premiers jours ; elle doit diminuer progressivement. Respecter les rendez-vous de contrôle permet de vérifier la bonne cicatrisation et d'ajuster la prise en charge si besoin.",
          "Certains signes doivent alerter et faire recontacter l'équipe soignante sans attendre : fièvre, rougeur, gonflement ou écoulement au niveau de la plaie, douleur qui s'intensifie, ventre dur et douloureux, vomissements, ou impossibilité d'uriner ou d'aller à la selle. En présence de signes de gravité (douleur intense, malaise, difficulté à respirer), il faut se rendre aux urgences ou appeler le 15 (SAMU) sans tarder.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte la chirurgie générale au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; le coût d'une intervention dépend de l'acte, de la clinique et de la durée d'hospitalisation. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Consultation pré-anesthésique", value: "200 – 400 MAD" },
        { label: "Cure de hernie (clinique privée)", value: "8 000 – 20 000 MAD" },
        { label: "Ablation de la vésicule (cœlioscopie)", value: "12 000 – 30 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026), hors prise en charge. Les assurés CNSS et AMO bénéficient d'un remboursement partiel des actes chirurgicaux sur dossier.",
    },
  },
  "optique": {
    synonyme: "opticien",
    description:
      "L'opticien est le professionnel de santé qui conçoit, réalise et adapte les équipements optiques — lunettes et lentilles de contact — à partir de l'ordonnance délivrée par un ophtalmologue. Il n'est pas médecin : il ne diagnostique pas les maladies de l'œil, mais corrige les défauts visuels (myopie, hypermétropie, astigmatisme, presbytie) selon la prescription. Au Maroc, les magasins d'optique sont nombreux et l'opticien joue un rôle clé d'accompagnement : choix de la monture, type de verres (unifocaux, progressifs, anti‑reflet, filtre lumière bleue), prise de mesures, montage et ajustement. Il réalise aussi des contrôles de vue de confort et oriente vers un ophtalmologue lorsque la correction évolue ou qu'un symptôme inhabituel apparaît. Bien distinguer opticien et ophtalmologue est essentiel : l'ordonnance médicale reste indispensable pour obtenir des verres correcteurs adaptés et durables.",
    quandConsulter: [
      "Renouvellement de lunettes avec une ordonnance valide",
      "Choix d'une monture et de verres adaptés",
      "Première adaptation de lentilles de contact",
      "Lunettes cassées, verres rayés ou inconfort",
      "Contrôle de confort entre deux visites chez l'ophtalmologue",
    ],
    faqs: [
      {
        q: "Quelle différence entre un opticien et un ophtalmologue ?",
        a: "L'ophtalmologue est un médecin qui examine les yeux, diagnostique les maladies oculaires et prescrit la correction. L'opticien réalise et adapte les lunettes et lentilles selon cette ordonnance, mais ne pose pas de diagnostic médical.",
      },
      {
        q: "Combien coûtent des lunettes au Maroc ?",
        a: "Le prix dépend de la monture et des verres : comptez environ 300 à 800 MAD pour une monture, 200 à 600 MAD pour des verres unifocaux et 800 à 2 500 MAD pour des verres progressifs. Certaines mutuelles et l'AMO remboursent une partie de l'équipement sur présentation de l'ordonnance.",
      },
      {
        q: "Faut-il une ordonnance pour acheter des lunettes ?",
        a: "Oui, une ordonnance récente d'un ophtalmologue est nécessaire pour des verres correcteurs adaptés. Sans correction médicale à jour, l'opticien ne peut pas garantir un équipement conforme à vos besoins visuels.",
      },
      {
        q: "Comment trouver un opticien au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par « Optique » et votre ville pour trouver un opticien proche, consulter les avis et prendre contact en ligne gratuitement.",
      },
    ],
    essentiel: [
      { value: "Sur ordonnance", label: "Verres correcteurs" },
      { value: "300 – 800 MAD", label: "Prix d'une monture" },
      { value: "≠ ophtalmologue", label: "Opticien : non médecin" },
    ],
    sections: [
      {
        h: "Quand se rendre chez l'opticien plutôt que chez l'ophtalmologue ?",
        body: [
          "On se rend chez l'opticien une fois l'ordonnance obtenue : pour choisir et faire monter ses lunettes, renouveler un équipement avec une prescription valide ou ajuster une monture. L'opticien réalise aussi des contrôles de confort.",
          "En revanche, toute baisse de vision, douleur, rougeur ou symptôme oculaire relève de l'ophtalmologue, seul habilité à diagnostiquer et à mettre à jour la correction.",
        ],
      },
      {
        h: "Bien choisir ses verres : unifocaux, progressifs et traitements",
        body: [
          "Les verres unifocaux corrigent un seul défaut (myopie, hypermétropie), tandis que les verres progressifs corrigent vision de loin et de près sur un même verre, utiles après la presbytie.",
          "Des traitements complémentaires améliorent le confort : anti‑reflet, durci anti‑rayures, filtre lumière bleue pour les écrans, ou verres photochromiques qui foncent au soleil. L'opticien vous conseille selon votre mode de vie.",
        ],
      },
      {
        h: "Lentilles de contact : adaptation et hygiène",
        body: [
          "La première utilisation de lentilles nécessite une adaptation : choix du type (journalières, mensuelles), apprentissage de la pose et des règles d'hygiène pour éviter les infections.",
          "Le respect du temps de port et de l'entretien est essentiel. En cas de rougeur ou de gêne persistante, retirez les lentilles et consultez un ophtalmologue.",
        ],
      },
      {
        h: "Remboursement de l'optique au Maroc",
        body: [
          "L'AMO et de nombreuses mutuelles prennent en charge une partie de l'équipement optique (monture et verres), généralement à intervalle régulier (par exemple tous les deux ans pour les adultes).",
          "Conservez l'ordonnance et la facture détaillée : elles sont indispensables pour votre remboursement. Les plafonds et conditions varient selon votre régime et votre complémentaire.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte un équipement optique au Maroc ?",
      intro:
        "Les prix sont libres et dépendent de la monture, du type de verres et des traitements choisis. Fourchettes indicatives constatées.",
      rows: [
        { label: "Monture", value: "300 – 800 MAD" },
        { label: "Verres unifocaux (la paire)", value: "200 – 600 MAD" },
        { label: "Verres progressifs (la paire)", value: "800 – 2 500 MAD" },
        { label: "Lentilles de contact (boîte)", value: "150 – 400 MAD" },
        { label: "Examen de vue de confort", value: "Souvent offert à l'achat" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). L'AMO et les mutuelles remboursent une partie de l'équipement sur présentation de l'ordonnance et de la facture.",
    },
  },

  "urologie-et-chirurgie-urologique": {
    synonyme: "urologue",
    reviewed: "2026-07-05",
    description:
      "L'urologue est le médecin spécialiste de l'appareil urinaire de l'homme et de la femme (reins, uretères, vessie, urètre) et de l'appareil génital masculin (prostate, testicules). Il diagnostique et traite les infections urinaires récidivantes, les calculs rénaux, les troubles de la miction, l'incontinence, les pathologies de la prostate (adénome, prostatite, dépistage du cancer) et les troubles de la fertilité ou de l'érection. C'est à la fois un médecin et un chirurgien : il réalise des actes endoscopiques et chirurgicaux, du traitement des calculs à la chirurgie de la prostate. Au Maroc, les calculs urinaires et les troubles prostatiques de l'homme après 50 ans sont des motifs fréquents de consultation. L'urologue s'appuie sur des examens ciblés — échographie, analyses d'urine, dosage du PSA, scanner — pour poser un diagnostic précis et proposer un traitement médical ou interventionnel adapté.",
    quandConsulter: [
      "Brûlures urinaires ou infections urinaires à répétition",
      "Coliques néphrétiques (calculs rénaux)",
      "Troubles de la miction ou envies fréquentes (prostate)",
      "Sang dans les urines",
      "Troubles de l'érection ou de la fertilité masculine",
    ],
    faqs: [
      {
        q: "Quand consulter un urologue ?",
        a: "On consulte un urologue en cas d'infections urinaires répétées, de calculs, de sang dans les urines, de troubles de la miction, ou pour le suivi de la prostate chez l'homme après 50 ans. Une orientation par le médecin généraliste est fréquente mais non obligatoire.",
      },
      {
        q: "Combien coûte une consultation chez un urologue au Maroc ?",
        a: "Une consultation coûte généralement entre 300 et 600 MAD selon la ville et le praticien. Les examens (échographie, dosage du PSA) et les actes chirurgicaux font l'objet de frais distincts ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "À partir de quel âge surveiller sa prostate ?",
        a: "Un dépistage des troubles de la prostate est généralement proposé chez l'homme à partir de 50 ans, ou plus tôt (45 ans) en cas d'antécédents familiaux de cancer de la prostate. Il associe un examen clinique et un dosage sanguin du PSA.",
      },
      {
        q: "Comment prendre rendez-vous avec un urologue au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Urologie » et votre ville pour trouver un urologue disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Comment se déroule une échographie ou une cystoscopie chez l'urologue ?", a: "L'échographie des voies urinaires est indolore et se fait au cabinet ou en centre d'imagerie, sans préparation lourde. La cystoscopie, examen de la vessie par une petite caméra souple, est réalisée sous anesthésie locale et dure quelques minutes ; elle peut être un peu inconfortable mais reste bien tolérée. Ces examens permettent de rechercher calculs, polypes ou anomalies de la paroi vésicale." },
      { q: "Le sang dans les urines est-il toujours grave ?", a: "Voir du sang dans les urines (hématurie) n'est jamais banal et justifie toujours une consultation, même si cela survient une seule fois et disparaît. Les causes vont de l'infection ou du calcul jusqu'à des lésions plus sérieuses de la vessie ou du rein qu'il faut écarter. En cas de saignement abondant avec caillots ou d'impossibilité d'uriner, rendez-vous aux urgences ou appelez le 15 (SAMU)." },
      { q: "L'incontinence urinaire se soigne-t-elle vraiment ?", a: "Oui, l'incontinence urinaire n'est pas une fatalité liée à l'âge et se traite dans la grande majorité des cas. Selon le type, l'urologue propose une rééducation périnéale, des médicaments, des dispositifs ou une chirurgie. Beaucoup de patients au Maroc consultent trop tard par gêne, alors qu'une prise en charge précoce améliore nettement la qualité de vie." },
      { q: "Ma consultation et mes examens d'urologie sont-ils remboursés au Maroc ?", a: "Une partie des soins d'urologie est prise en charge par l'AMO via la CNSS ou la CNOPS, sur la base des tarifs de référence de l'ANAM (TNR). Dans le privé, les honoraires étant libres, un reste à charge existe souvent, notamment pour la chirurgie. Demandez un devis et une feuille de soins, et vérifiez l'accord préalable pour les actes lourds ou l'hospitalisation." },
      { q: "Comment bien préparer sa première consultation chez l'urologue ?", a: "Apportez vos analyses d'urine et de sang récentes, vos comptes rendus d'échographie ou de scanner, et la liste de vos traitements en cours. Notez vos symptômes (fréquence des envies, brûlures, jet faible, réveils nocturnes) et depuis quand ils durent. Pour un dosage de PSA, évitez tout effort à vélo ou rapport sexuel dans les 48 heures précédant la prise de sang." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Dès 50 ans", label: "Suivi de la prostate (homme)" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Calculs urinaires : reconnaître et traiter une colique néphrétique",
        body: [
          "Les calculs rénaux provoquent des douleurs lombaires intenses (coliques néphrétiques) pouvant irradier vers le bas‑ventre, parfois accompagnées de sang dans les urines. Le climat chaud et une hydratation insuffisante en favorisent la formation au Maroc.",
          "Selon la taille et la localisation, le traitement va de l'hydratation et des antalgiques à la fragmentation par ondes de choc ou à l'intervention endoscopique. Boire suffisamment reste la meilleure prévention.",
        ],
      },
      {
        h: "Santé de la prostate après 50 ans",
        body: [
          "Avec l'âge, la prostate augmente de volume (adénome) et peut gêner la miction : jet faible, envies nocturnes, sensation de vidange incomplète. Ces symptômes justifient une consultation, même s'ils sont le plus souvent bénins.",
          "Le suivi régulier permet aussi de dépister précocement le cancer de la prostate, fréquent et de bon pronostic lorsqu'il est détecté tôt. L'urologue adapte la surveillance à votre âge et à vos antécédents.",
        ],
      },
      {
        h: "Infections urinaires : quand s'inquiéter ?",
        body: [
          "Les infections urinaires simples sont fréquentes, surtout chez la femme, et se traitent par antibiotiques. Mais des infections répétées, de la fièvre, des douleurs lombaires ou du sang dans les urines doivent amener à consulter.",
          "Chez l'homme, toute infection urinaire mérite un avis car elle peut révéler une cause sous‑jacente (prostate, calcul). L'urologue recherche et traite la cause, pas seulement les symptômes.",
        ],
      },
      {
        h: "Troubles de l'érection et fertilité masculine",
        body: [
          "L'urologue prend aussi en charge les troubles de l'érection et de la fertilité masculine. Ces motifs, encore tabous, sont pourtant courants et souvent bien traités une fois la cause identifiée.",
          "Un bilan recherche les facteurs en jeu (vasculaires, hormonaux, psychologiques, liés au mode de vie ou à certains médicaments) et oriente vers une prise en charge adaptée. La consultation est confidentielle.",
        ],
      },
      {
        h: "Cancers urologiques : l'intérêt d'un diagnostic précoce",
        body: [
          "L'urologue prend en charge les cancers de la prostate, de la vessie, du rein et du testicule. Beaucoup de ces maladies évoluent longtemps en silence : c'est pourquoi des signaux comme du sang dans les urines, une gêne persistante ou une masse au niveau d'un testicule ne doivent jamais être négligés. Chez l'homme, l'auto-examen des testicules après la douche et la vigilance sur les troubles urinaires après 50 ans font partie des réflexes utiles.",
          "Au Maroc, la prise en charge associe l'urologue à l'oncologue et au radiothérapeute, dans le public comme dans le privé. Un diagnostic posé tôt élargit les options de traitement, souvent moins lourdes, et améliore le pronostic. Devant tout symptôme inhabituel et durable, il vaut mieux consulter sans attendre plutôt que de reporter par crainte du résultat.",
        ],
      },
      {
        h: "Boire, bouger, manger : prévenir les troubles urologiques au quotidien",
        body: [
          "Une bonne hydratation, avec une eau suffisante répartie sur la journée, reste le premier geste de prévention contre les calculs et les infections urinaires, en particulier lors des fortes chaleurs de l'été marocain. Limiter le sel, modérer les aliments très riches en protéines animales et surveiller son poids réduisent aussi le risque de récidive de lithiase et soulagent la vessie.",
          "L'activité physique régulière, l'arrêt du tabac et une consommation d'alcool nulle ou très modérée protègent la vessie et la fonction érectile. Ne pas se retenir trop longtemps d'uriner, aller aux toilettes après les rapports sexuels et traiter la constipation participent également à la santé des voies urinaires. Ces habitudes simples complètent, sans jamais les remplacer, les avis et le suivi de votre urologue.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un urologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens et actes chirurgicaux sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Échographie de l'appareil urinaire", value: "300 – 600 MAD" },
        { label: "Dosage du PSA (analyse)", value: "100 – 250 MAD" },
        { label: "Fragmentation de calculs (séance)", value: "3 000 – 8 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "orthodontie": {
    synonyme: "orthodontiste",
    reviewed: "2026-07-05",
    description:
      "L'orthodontiste est le chirurgien‑dentiste spécialisé dans la correction de la position des dents et des mâchoires. Il diagnostique et traite les malpositions dentaires, les chevauchements, les écarts et les décalages des mâchoires qui affectent l'esthétique du sourire, la mastication et parfois l'élocution. Le traitement repose sur des appareils — bagues métalliques ou céramiques, gouttières transparentes amovibles — portés sur plusieurs mois à quelques années. Historiquement associé aux enfants et adolescents, l'orthodontie concerne aujourd'hui aussi de nombreux adultes au Maroc, grâce à des solutions plus discrètes. Un bilan précoce chez l'enfant (vers 7‑8 ans) permet de repérer les anomalies de croissance et d'intervenir au meilleur moment. Au‑delà de l'esthétique, un bon alignement facilite l'hygiène bucco‑dentaire et prévient l'usure et les problèmes de gencives à long terme.",
    quandConsulter: [
      "Dents mal alignées, chevauchées ou espacées",
      "Décalage des mâchoires (le menton en avant ou en arrière)",
      "Bilan orthodontique de l'enfant (vers 7‑8 ans)",
      "Difficulté à mastiquer ou à fermer la bouche correctement",
      "Souhait d'aligner ses dents à l'âge adulte",
    ],
    faqs: [
      {
        q: "À quel âge commencer un traitement orthodontique ?",
        a: "Un premier bilan est conseillé vers 7‑8 ans pour dépister les anomalies de croissance. Le traitement actif débute souvent à l'adolescence, mais l'orthodontie est aussi possible à l'âge adulte, à tout âge, tant que les gencives sont saines.",
      },
      {
        q: "Combien coûte un traitement orthodontique au Maroc ?",
        a: "Un traitement complet coûte généralement entre 8 000 et 25 000 MAD selon la technique (bagues ou gouttières transparentes) et la durée. Le règlement s'étale souvent en mensualités ; les assurés CNSS ou AMO peuvent bénéficier d'une prise en charge partielle, surtout pour les enfants.",
      },
      {
        q: "Bagues ou gouttières transparentes : que choisir ?",
        a: "Les bagues conviennent à tous les cas, y compris complexes, et sont plus économiques. Les gouttières transparentes amovibles sont plus discrètes et confortables, adaptées aux cas légers à modérés, mais exigent un port rigoureux. L'orthodontiste recommande la solution selon votre situation.",
      },
      {
        q: "Comment trouver un orthodontiste au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Orthodontie » et votre ville pour trouver un orthodontiste, consulter les avis patients vérifiés et prendre rendez-vous en ligne gratuitement.",
      },
      { q: "L'orthodontie est-elle remboursée par la CNSS ou l'AMO au Maroc ?", a: "L'AMO peut prendre en charge une partie du traitement orthodontique lorsqu'il est débuté avant un certain âge chez l'enfant et sur accord préalable de l'organisme (ANAM/CNSS ou CNOPS). Le remboursement est plafonné par semestre de traitement et ne couvre jamais les actes à visée purement esthétique chez l'adulte. Demandez à votre orthodontiste un devis détaillé et une entente préalable avant de commencer." },
      { q: "Faut-il extraire des dents pour poser un appareil orthodontique ?", a: "Les extractions ne sont pas systématiques : elles ne sont envisagées que lorsque le manque de place est important et ne peut être compensé autrement. De nombreux traitements se font aujourd'hui sans extraction grâce à l'expansion ou au recul des dents. Votre orthodontiste décide après analyse des radiographies et des empreintes." },
      { q: "Un dentiste généraliste peut-il poser des bagues, ou faut-il un orthodontiste ?", a: "L'orthodontie est une spécialité reconnue nécessitant une formation complémentaire après le diplôme de chirurgien-dentiste. Un dentiste généraliste peut réaliser certains actes simples, mais un traitement complet par bagues ou gouttières relève de l'orthodontiste spécialiste. Vérifiez la qualification du praticien, notamment pour les cas complexes de croissance ou de chirurgie combinée." },
      { q: "Que faire en cas de bague décollée ou de fil qui blesse ?", a: "Une bague décollée ou un fil qui pique n'est pas une urgence vitale : appliquez de la cire orthodontique sur la zone gênante et contactez votre cabinet pour un rendez-vous rapide. En attendant, évitez les aliments durs ou collants. Ne coupez jamais un fil vous-même sans avis du praticien." },
      { q: "Peut-on faire de l'orthodontie pendant la grossesse ?", a: "Un traitement orthodontique peut généralement se poursuivre pendant la grossesse, car il ne repose pas sur des médicaments. Les radiographies sont toutefois reportées ou protégées par un tablier plombé, et les gencives, plus sensibles durant cette période, demandent une hygiène renforcée. Signalez votre grossesse à votre orthodontiste pour adapter le suivi." },
    ],
    essentiel: [
      { value: "Dès 7‑8 ans", label: "Âge du premier bilan" },
      { value: "8 000 – 25 000 MAD", label: "Traitement complet (indicatif)" },
      { value: "Enfants & adultes", label: "Possible à tout âge" },
    ],
    sections: [
      {
        h: "Orthodontie de l'enfant : pourquoi un bilan précoce ?",
        body: [
          "Vers 7‑8 ans, les premières dents définitives et la croissance des mâchoires permettent à l'orthodontiste de repérer des anomalies avant qu'elles ne s'aggravent. Une intervention précoce peut guider la croissance et simplifier le traitement ultérieur.",
          "Tous les enfants n'ont pas besoin d'un appareil immédiat : le bilan sert souvent à surveiller et à choisir le bon moment pour agir.",
        ],
      },
      {
        h: "L'orthodontie de l'adulte : il n'est jamais trop tard",
        body: [
          "De plus en plus d'adultes entreprennent un traitement orthodontique, pour des raisons esthétiques ou fonctionnelles. Les solutions discrètes (gouttières transparentes, bagues céramiques) ont levé un frein important.",
          "Chez l'adulte, l'état des gencives et de l'os est évalué au préalable. Le traitement peut durer un peu plus longtemps, mais les résultats sont durables avec une bonne contention.",
        ],
      },
      {
        h: "Bagues, gouttières et contention : comment ça marche",
        body: [
          "Les appareils exercent des forces légères et continues qui déplacent progressivement les dents vers leur position cible. Des contrôles réguliers permettent d'ajuster le traitement.",
          "À la fin, une phase de contention (fil collé ou gouttière de nuit) est indispensable pour stabiliser le résultat et éviter que les dents ne reprennent leur position initiale.",
        ],
      },
      {
        h: "Hygiène et durée du traitement",
        body: [
          "Pendant le traitement, une hygiène rigoureuse est essentielle, surtout avec des bagues qui retiennent la plaque : brossage minutieux, brossettes et contrôles dentaires réguliers évitent caries et taches.",
          "La durée varie de quelques mois pour un cas léger à 2‑3 ans pour un cas complexe. La régularité des rendez-vous et le respect des consignes conditionnent la réussite.",
        ],
      },
      {
        h: "Bilan orthodontique : radiographies, empreintes et plan de traitement",
        body: [
          "Avant tout appareil, l'orthodontiste réalise un bilan complet : examen clinique, radiographie panoramique, téléradiographie de profil (céphalométrie) et empreintes ou scan numérique des arcades. Ces éléments permettent d'analyser la position des dents, la croissance des mâchoires et les relations entre le haut et le bas du visage. Au Maroc, ce bilan est proposé en secteur privé comme dans certains services hospitaliers universitaires.",
          "À partir de ce diagnostic, le praticien établit un plan de traitement personnalisé et un devis chiffré, incluant la durée estimée, le type d'appareil et le nombre de visites. C'est le moment de poser vos questions sur les alternatives, le coût global et la prise en charge par l'AMO. Un plan clair et écrit est un gage de sérieux et vous protège en cas de désaccord ultérieur.",
        ],
      },
      {
        h: "Orthodontie et chirurgie : quand les deux se combinent",
        body: [
          "Certains décalages importants entre la mâchoire du haut et celle du bas ne peuvent être corrigés par le seul appareil dentaire une fois la croissance terminée. Dans ces cas, l'orthodontiste travaille en équipe avec un chirurgien maxillo-facial : c'est l'orthodontie chirurgicale, qui associe une phase de préparation par appareil, une intervention au bloc, puis une phase de finition. Ce parcours concerne surtout l'adulte présentant un décalage squelettique marqué.",
          "Ce type de prise en charge se déroule en milieu hospitalier ou en clinique et nécessite une coordination étroite entre les praticiens. Les délais sont plus longs et le coût plus élevé qu'un traitement classique, mais le résultat porte autant sur la fonction (mastication, respiration) que sur l'esthétique. En cas de traumatisme facial aigu avec fracture ou saignement important, il s'agit d'une urgence : appelez le 15 (SAMU) sans attendre.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte un traitement orthodontique au Maroc ?",
      intro:
        "Les honoraires sont libres et dépendent de la technique et de la durée. Le règlement est généralement échelonné en mensualités. Fourchettes indicatives.",
      rows: [
        { label: "Consultation / bilan orthodontique", value: "150 – 400 MAD" },
        { label: "Traitement par bagues métalliques", value: "8 000 – 15 000 MAD" },
        { label: "Traitement par bagues céramiques", value: "12 000 – 20 000 MAD" },
        { label: "Gouttières transparentes", value: "15 000 – 25 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026), souvent réglés en mensualités. Les assurés CNSS et AMO peuvent bénéficier d'une prise en charge partielle, en particulier pour les enfants.",
    },
  },

  "gastro-enterologie": {
    synonyme: "gastro-entérologue",
    reviewed: "2026-07-05",
    description:
      "Le gastro-entérologue est le médecin spécialiste de l'appareil digestif : œsophage, estomac, intestins, côlon, foie, voies biliaires et pancréas. Il diagnostique et traite le reflux gastro-œsophagien, l'ulcère, le syndrome de l'intestin irritable, les maladies inflammatoires chroniques de l'intestin (maladie de Crohn, rectocolite), les hépatites et les troubles du transit. Il réalise les examens endoscopiques de référence — fibroscopie (gastroscopie) et coloscopie — qui permettent d'explorer le tube digestif et de dépister précocement le cancer colorectal. Au Maroc, les troubles digestifs et les hépatites virales sont des motifs fréquents de consultation, et le dépistage du cancer du côlon après 50 ans gagne en importance. Le gastro-entérologue s'appuie sur ces examens, l'imagerie et les analyses pour poser un diagnostic précis et proposer un traitement médical ou, si nécessaire, orienter vers la chirurgie.",
    quandConsulter: [
      "Brûlures d'estomac ou reflux persistant",
      "Douleurs abdominales chroniques ou ballonnements",
      "Troubles du transit (diarrhée, constipation, sang dans les selles)",
      "Dépistage du cancer colorectal après 50 ans",
      "Suivi d'une hépatite ou d'une maladie du foie",
    ],
    faqs: [
      {
        q: "Qu'est-ce qu'une fibroscopie et une coloscopie ?",
        a: "La fibroscopie (gastroscopie) explore l'œsophage, l'estomac et le duodénum à l'aide d'une caméra souple ; la coloscopie explore le côlon. Ces examens, souvent réalisés sous sédation, permettent de diagnostiquer et parfois de traiter (retrait de polypes) dans le même temps.",
      },
      {
        q: "Combien coûte une consultation chez un gastro-entérologue au Maroc ?",
        a: "Une consultation coûte généralement entre 300 et 600 MAD selon la ville et le praticien. Une fibroscopie ou une coloscopie font l'objet de frais distincts ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur dossier.",
      },
      {
        q: "À quel âge faire un dépistage du cancer du côlon ?",
        a: "Le dépistage du cancer colorectal est recommandé à partir de 50 ans, ou plus tôt en cas d'antécédents familiaux. La coloscopie permet de détecter et de retirer les polypes avant qu'ils n'évoluent, ce qui en fait un examen très efficace de prévention.",
      },
      {
        q: "Comment prendre rendez-vous avec un gastro-entérologue au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Gastro-entérologie » et votre ville pour trouver un praticien disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Comment se préparer à une coloscopie au Maroc ?", a: "La préparation repose sur un régime sans résidus les jours précédant l'examen, puis la prise d'une solution laxative (PEG) selon le protocole remis par votre gastro-entérologue afin de nettoyer complètement le côlon. Il faut être à jeun avant l'examen et organiser un accompagnant, car la sédation empêche de conduire ensuite. Une préparation bien suivie conditionne directement la qualité et la fiabilité de l'examen." },
      { q: "La fibroscopie et la coloscopie sont-elles prises en charge par la CNSS ou l'AMO ?", a: "Ces endoscopies figurent dans la nomenclature des actes et peuvent faire l'objet d'un remboursement partiel par l'AMO (CNSS, CNOPS) sur la base des tarifs de référence, notamment lorsqu'elles sont prescrites pour un motif médical. Le reste à charge dépend du secteur (public ou clinique privée) et du dépassement d'honoraires éventuel. Demandez un devis et une feuille de soins détaillée pour constituer votre dossier de remboursement." },
      { q: "Une infection à Helicobacter pylori, est-ce grave ?", a: "Helicobacter pylori est une bactérie de l'estomac très fréquente au Maroc, souvent contractée dans l'enfance, et responsable de nombreuses gastrites et ulcères. Elle se recherche par un test respiratoire, une analyse de selles ou une biopsie lors de la fibroscopie, puis se traite par une association d'antibiotiques et d'antiacides. Un traitement bien conduit permet le plus souvent une éradication complète, avec un contrôle recommandé après la cure." },
      { q: "Quand une constipation ou une diarrhée doit-elle amener à consulter ?", a: "Il faut consulter un gastro-entérologue si les troubles du transit durent plusieurs semaines, s'aggravent, ou s'accompagnent de signes d'alerte : sang dans les selles, amaigrissement inexpliqué, douleurs nocturnes, anémie ou fièvre. Chez une personne de plus de 50 ans, un changement récent et durable du transit justifie toujours un avis. En cas de diarrhée aiguë avec déshydratation, fièvre élevée ou douleur intense, contactez les urgences (SAMU 15)." },
      { q: "Quels examens permettent d'explorer le foie et le pancréas ?", a: "Au-delà de la prise de sang (bilan hépatique, enzymes pancréatiques), le gastro-entérologue s'appuie sur l'échographie abdominale en première intention, complétée si besoin par un scanner ou une IRM. Pour les voies biliaires et le pancréas, une IRM spécifique (cholangio-IRM) ou une écho-endoscopie peuvent être demandées. Le choix des examens dépend des symptômes et des premiers résultats biologiques." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Dès 50 ans", label: "Dépistage du cancer du côlon" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Reflux, brûlures d'estomac et ulcère",
        body: [
          "Le reflux gastro-œsophagien provoque des brûlures remontant derrière le sternum, surtout après les repas ou en position allongée. Fréquent et souvent bénin, il peut néanmoins altérer la qualité de vie et abîmer l'œsophage à long terme.",
          "Lorsqu'il est persistant, associé à une difficulté à avaler ou à un amaigrissement, une fibroscopie est recommandée pour rechercher une œsophagite, un ulcère ou la bactérie Helicobacter pylori, traitée par antibiotiques.",
        ],
      },
      {
        h: "Le dépistage du cancer colorectal",
        body: [
          "Le cancer du côlon est l'un des plus fréquents, mais aussi l'un des plus évitables : il se développe le plus souvent à partir de polypes que la coloscopie permet de retirer avant toute transformation.",
          "Un dépistage à partir de 50 ans, ou plus tôt en cas d'antécédents familiaux, sauve des vies. Tout saignement dans les selles ou changement durable du transit doit amener à consulter sans attendre.",
        ],
      },
      {
        h: "Syndrome de l'intestin irritable et troubles fonctionnels",
        body: [
          "Le syndrome de l'intestin irritable associe douleurs abdominales, ballonnements et troubles du transit, sans lésion visible. Très fréquent, il est bénin mais parfois invalidant au quotidien.",
          "Le gastro-entérologue confirme le diagnostic en écartant d'autres causes, puis propose des mesures diététiques, une gestion du stress et des traitements ciblant les symptômes.",
        ],
      },
      {
        h: "Hépatites et santé du foie",
        body: [
          "Le foie peut être touché par des hépatites virales (B et C), l'alcool ou la surcharge en graisses (stéatose), souvent sans symptôme au début. Un bilan sanguin et une échographie permettent de les détecter.",
          "Le gastro-entérologue assure le suivi et le traitement de ces atteintes ; les hépatites virales bénéficient aujourd'hui de traitements efficaces, d'où l'intérêt d'un dépistage précoce.",
        ],
      },
      {
        h: "Reconnaître les signes d'alerte digestifs",
        body: [
          "Certains symptômes digestifs doivent conduire à consulter un gastro-entérologue sans tarder, car ils peuvent révéler une maladie nécessitant une prise en charge rapide. Parmi ces signes d'alerte figurent la présence de sang dans les selles ou les vomissements, une difficulté ou une douleur à avaler, un amaigrissement inexpliqué, une anémie, des douleurs abdominales persistantes ou nocturnes, ainsi qu'un changement durable du transit après 50 ans. Ces manifestations ne signifient pas systématiquement une pathologie grave, mais elles justifient un bilan pour écarter les causes sérieuses.",
          "En cas de douleur abdominale brutale et intense, de vomissements de sang abondants, de selles noires avec malaise, ou de signes de déshydratation sévère, il s'agit d'une urgence : contactez immédiatement le SAMU (15). En dehors de ces situations aiguës, un rendez-vous programmé avec un gastro-entérologue permet de réaliser les examens adaptés, comme une fibroscopie ou une échographie, et d'orienter le diagnostic. Consulter tôt améliore nettement les chances d'un traitement simple et efficace.",
        ],
      },
      {
        h: "Le rôle de l'alimentation et de l'hygiène de vie",
        body: [
          "De nombreux troubles digestifs suivis par le gastro-entérologue sont étroitement liés au mode de vie. Une alimentation équilibrée, riche en fibres, une bonne hydratation, une consommation modérée d'aliments gras, épicés ou très sucrés, ainsi que la limitation de l'alcool et du tabac contribuent au confort digestif et à la prévention de plusieurs pathologies. L'activité physique régulière favorise un transit normal et participe à la santé du foie, notamment en limitant la stéatose hépatique, fréquente au Maroc en lien avec le surpoids et le diabète.",
          "Le gastro-entérologue ne se limite pas à traiter les symptômes : il intègre des conseils personnalisés d'hygiène de vie dans la prise en charge globale du patient. Adapter son alimentation, gérer le stress et respecter des horaires de repas réguliers font souvent partie intégrante du traitement, en complément des médicaments lorsque ceux-ci sont nécessaires. Ces mesures, simples mais durables, réduisent les récidives et améliorent la qualité de vie sur le long terme.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un gastro-entérologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens endoscopiques sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Fibroscopie (gastroscopie)", value: "800 – 2 000 MAD" },
        { label: "Coloscopie", value: "1 500 – 4 000 MAD" },
        { label: "Échographie abdominale", value: "300 – 600 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "oto-rhino-laryngologie": {
    synonyme: "oto-rhino-laryngologiste",
    reviewed: "2026-07-05",
    description:
      "L'oto-rhino-laryngologiste (ORL) est le médecin spécialiste des oreilles, du nez, de la gorge et des structures de la tête et du cou. Il diagnostique et traite les otites, les baisses d'audition et acouphènes, les vertiges, les sinusites et allergies nasales, les angines à répétition, les troubles de la voix et les pathologies des amygdales et végétations. C'est aussi un chirurgien : il opère les amygdales, les végétations, les sinus, ou pose des aérateurs trans-tympaniques chez l'enfant. Au Maroc, les infections ORL de l'enfant et les sinusites chroniques de l'adulte sont des motifs très fréquents de consultation. L'ORL explore l'audition (audiogramme), l'équilibre et les voies aériennes à l'aide d'examens dédiés, puis propose un traitement médical ou chirurgical adapté. Il prend également en charge le ronflement et l'apnée du sommeil en lien avec les voies aériennes supérieures.",
    quandConsulter: [
      "Otites à répétition ou douleurs d'oreille",
      "Baisse d'audition, acouphènes ou vertiges",
      "Sinusite chronique, nez bouché ou allergies",
      "Angines à répétition, amygdales ou végétations (enfant)",
      "Enrouement persistant ou troubles de la voix",
    ],
    faqs: [
      {
        q: "Quand faut-il opérer les amygdales ou les végétations d'un enfant ?",
        a: "L'ablation est envisagée en cas d'angines à répétition, d'apnées du sommeil, d'otites séreuses récidivantes ou d'obstruction nasale gênant la respiration et le sommeil. L'ORL évalue le rapport bénéfice-risque au cas par cas.",
      },
      {
        q: "Combien coûte une consultation chez un ORL au Maroc ?",
        a: "Une consultation coûte généralement entre 250 et 500 MAD selon la ville et le praticien. L'audiogramme et les actes chirurgicaux font l'objet de frais distincts ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "Que faire en cas de baisse d'audition ou d'acouphènes ?",
        a: "Une baisse d'audition ou des acouphènes persistants justifient une consultation ORL avec audiogramme. La cause peut être un simple bouchon de cérumen, une otite, ou une atteinte de l'oreille interne nécessitant une prise en charge spécifique.",
      },
      {
        q: "Comment prendre rendez-vous avec un ORL au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Oto-rhino-laryngologie » et votre ville pour trouver un ORL disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Quels sont les symptômes d'un cancer ORL et quand faut-il consulter rapidement ?", a: "Une voix enrouée depuis plus de trois semaines, une gêne ou une douleur persistante à la gorge, une difficulté à avaler ou un ganglion dur dans le cou qui ne disparaît pas doivent amener à consulter un ORL sans tarder. Le tabac et l'alcool en augmentent le risque. Une consultation précoce permet un examen de la gorge et du larynx et, si besoin, une biopsie." },
      { q: "Comment se déroule le retrait d'un bouchon de cérumen chez l'ORL ?", a: "L'ORL examine le conduit auditif au microscope puis retire le bouchon par micro-aspiration, à la curette ou par lavage à l'eau tiède. Le geste est indolore et dure quelques minutes. Il est déconseillé d'utiliser des cotons-tiges ou des bougies auriculaires qui tassent le cérumen et peuvent blesser le tympan." },
      { q: "Que faire en cas de saignement de nez fréquent (épistaxis) ?", a: "En cas de saignement, penchez la tête légèrement en avant et pincez fermement les ailes du nez pendant dix minutes en respirant par la bouche. Si le saignement persiste au-delà de vingt minutes, est très abondant ou se répète souvent, consultez un ORL ou les urgences. Des saignements répétés peuvent révéler une hypertension ou une fragilité des vaisseaux à traiter." },
      { q: "Un corps étranger coincé dans le nez, l'oreille ou la gorge, est-ce une urgence ?", a: "Chez l'enfant, une bille, une pile bouton ou un aliment coincé dans le nez ou l'oreille nécessite un avis ORL rapide, car une pile peut brûler les tissus en quelques heures. Si un objet ou un aliment bloque la gorge et gêne la respiration, appelez immédiatement le 15 (SAMU). N'essayez pas de retirer l'objet vous-même au risque de l'enfoncer davantage." },
      { q: "Faut-il une ordonnance ou un examen préalable avant de consulter un ORL au Maroc ?", a: "Dans le privé, vous pouvez consulter un ORL directement sans être adressé par un généraliste. Dans le secteur public (CHU, hôpitaux), un passage par le médecin traitant ou le centre de santé facilite souvent l'accès. Apportez vos examens antérieurs (audiogramme, scanner, IRM) s'ils existent pour éviter de les refaire." },
    ],
    essentiel: [
      { value: "250 – 500 MAD", label: "Tarif d'une consultation" },
      { value: "Oreille · nez · gorge", label: "Champ de la spécialité" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Les infections ORL de l'enfant",
        body: [
          "Otites, rhinopharyngites et angines sont très fréquentes chez l'enfant, dont le système immunitaire est en apprentissage. La plupart guérissent simplement, mais leur répétition peut justifier un avis ORL.",
          "Les otites séreuses prolongées peuvent gêner l'audition et le langage : un dépistage permet de proposer, si besoin, des aérateurs trans-tympaniques pour rétablir une bonne audition.",
        ],
      },
      {
        h: "Sinusites et allergies nasales",
        body: [
          "Le nez bouché chronique, les écoulements et les douleurs du visage évoquent une sinusite ou une rhinite allergique, fréquentes au Maroc en période de pollens et de poussière.",
          "L'ORL distingue l'origine allergique, infectieuse ou anatomique (cloison déviée, polypes) et propose un traitement adapté, du lavage de nez aux sprays, jusqu'à la chirurgie pour les cas résistants.",
        ],
      },
      {
        h: "Audition, acouphènes et vertiges",
        body: [
          "L'ORL explore l'audition par audiogramme et recherche la cause d'une baisse auditive, d'acouphènes ou de vertiges, qui peuvent provenir de l'oreille externe, moyenne ou interne.",
          "Une prise en charge précoce améliore le pronostic : appareillage auditif, traitement médical ou rééducation vestibulaire pour les troubles de l'équilibre, selon le diagnostic.",
        ],
      },
      {
        h: "Ronflement et apnée du sommeil",
        body: [
          "Le ronflement et les pauses respiratoires pendant le sommeil (apnées) fatiguent et exposent à des risques cardiovasculaires. Ils sont souvent liés à un obstacle sur les voies aériennes supérieures.",
          "L'ORL évalue ces voies et collabore au diagnostic du syndrome d'apnées du sommeil, dont la prise en charge (appareillage, parfois chirurgie) améliore nettement la qualité de vie.",
        ],
      },
      {
        h: "La chirurgie ORL : de la consultation à l'intervention",
        body: [
          "L'ORL prend en charge de nombreuses interventions courantes : ablation des amygdales et des végétations, pose d'aérateurs trans-tympaniques (« yoyos »), chirurgie du nez et des sinus, correction d'une déviation de la cloison nasale (septoplastie), ou encore chirurgie de l'oreille. Beaucoup de ces gestes se pratiquent aujourd'hui en ambulatoire, avec une sortie le jour même, sous anesthésie générale ou locale selon les cas. Un bilan pré-opératoire et une consultation d'anesthésie sont demandés avant toute intervention programmée.",
          "Au Maroc, ces actes sont réalisés en clinique privée ou en hôpital public. Dans le privé, les honoraires du chirurgien, de l'anesthésiste et le forfait de clinique s'additionnent, d'où l'intérêt de demander un devis détaillé à l'avance et de vérifier la prise en charge par votre organisme (CNSS/AMO) selon le tarif de référence ANAM. Renseignez-vous sur le taux de remboursement et sur l'éventuel reste à charge avant de vous engager.",
        ],
      },
      {
        h: "Préparer sa consultation ORL",
        body: [
          "Pour tirer le meilleur parti de votre rendez-vous, notez à l'avance vos symptômes, leur ancienneté et les circonstances qui les aggravent (bruit, position, saison, alimentation). Apportez la liste de vos traitements en cours, vos antécédents et tout examen déjà réalisé : audiogramme, scanner des sinus, IRM ou compte rendu d'une précédente intervention. Si vous consultez pour votre enfant, précisez ses épisodes d'otites, de ronflement ou d'infections répétées.",
          "L'examen ORL est en grande partie indolore : le médecin inspecte les oreilles, le nez et la gorge, parfois à l'aide d'un microscope ou d'un endoscope fin (nasofibroscopie) pour explorer les fosses nasales et le larynx. Des examens complémentaires comme un audiogramme ou une imagerie peuvent être prescrits le jour même ou lors d'un second rendez-vous. N'hésitez pas à poser vos questions sur le diagnostic, les options de traitement et le suivi.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un ORL au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les examens et actes chirurgicaux sont facturés séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "250 – 500 MAD" },
        { label: "Audiogramme (bilan auditif)", value: "200 – 500 MAD" },
        { label: "Ablation des amygdales (clinique)", value: "6 000 – 15 000 MAD" },
        { label: "Chirurgie des sinus", value: "8 000 – 20 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
    },
  },

  "pneumo-phtisiologie": {
    synonyme: "pneumologue",
    reviewed: "2026-07-05",
    description:
      "Le pneumologue est le médecin spécialiste de l'appareil respiratoire : poumons, bronches et plèvre. Il diagnostique et traite l'asthme, la bronchopneumopathie chronique obstructive (BPCO), les infections respiratoires, les allergies pulmonaires, l'apnée du sommeil et la tuberculose — la phtisiologie. Cette dernière garde une importance particulière au Maroc, où la tuberculose reste un enjeu de santé publique faisant l'objet d'un programme national de dépistage et de traitement gratuit. Le pneumologue s'appuie sur des examens dédiés : radiographie et scanner du thorax, exploration fonctionnelle respiratoire (spirométrie), tests allergologiques et enregistrement du sommeil. Le tabagisme étant la principale cause de maladies respiratoires chroniques, le pneumologue joue aussi un rôle clé dans l'aide au sevrage tabagique. Toute toux persistante, essoufflement anormal ou crachat de sang justifie une consultation.",
    quandConsulter: [
      "Toux persistante de plus de trois semaines",
      "Essoufflement anormal ou sifflements respiratoires",
      "Crises d'asthme ou allergies respiratoires",
      "Suspicion ou suivi de tuberculose",
      "Ronflement avec fatigue (apnée du sommeil) ou sevrage tabagique",
    ],
    faqs: [
      {
        q: "La tuberculose se soigne-t-elle au Maroc ?",
        a: "Oui. La tuberculose se guérit grâce à un traitement antibiotique prolongé (plusieurs mois), pris régulièrement. Au Maroc, le dépistage et le traitement sont assurés gratuitement dans le cadre du programme national de lutte contre la tuberculose.",
      },
      {
        q: "Combien coûte une consultation chez un pneumologue au Maroc ?",
        a: "Une consultation coûte généralement entre 300 et 600 MAD selon la ville et le praticien. Les explorations (spirométrie, scanner) font l'objet de frais distincts ; les assurés CNSS ou AMO bénéficient d'un remboursement partiel.",
      },
      {
        q: "Quand s'inquiéter d'une toux persistante ?",
        a: "Une toux qui dure plus de trois semaines, surtout chez un fumeur, ou accompagnée d'essoufflement, de fièvre prolongée, d'amaigrissement ou de crachats sanglants, doit amener à consulter un pneumologue pour en rechercher la cause.",
      },
      {
        q: "Comment prendre rendez-vous avec un pneumologue au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Pneumo-phtisiologie » et votre ville pour trouver un pneumologue disponible, consulter ses avis patients vérifiés et réserver en ligne gratuitement.",
      },
      { q: "Qu'est-ce qu'une exploration fonctionnelle respiratoire (EFR / spirométrie) ?", a: "L'EFR mesure votre souffle : volumes et débits d'air lors de l'inspiration et de l'expiration. Cet examen indolore, réalisé en cabinet de pneumologie, aide à diagnostiquer et suivre l'asthme, la BPCO ou une fibrose. Il dure quelques minutes et consiste à souffler dans un embout selon les consignes du technicien. Une partie du coût peut être remboursée par l'AMO/CNSS selon la cotation ANAM." },
      { q: "Quand faut-il faire une radiographie ou un scanner thoracique ?", a: "Votre pneumologue peut prescrire une radiographie du thorax devant une toux prolongée, une gêne respiratoire ou une infection suspectée. Le scanner thoracique (TDM) est demandé pour préciser une image anormale, explorer des nodules ou une suspicion d'embolie pulmonaire. Ces examens sont largement disponibles dans le privé et le public au Maroc. Apportez toujours vos anciens clichés pour la comparaison." },
      { q: "Quels signes respiratoires imposent d'appeler les urgences (15) ?", a: "Appelez immédiatement le SAMU (15) en cas de difficulté respiratoire brutale, de douleur thoracique intense, de lèvres ou d'ongles bleutés, ou d'incapacité à parler par manque de souffle. Une crise d'asthme qui ne cède pas au traitement habituel et un crachat de sang abondant sont aussi des urgences. Ne conduisez pas vous-même : mieux vaut être pris en charge sans délai." },
      { q: "Comment se soigne une pneumonie au Maroc ?", a: "La pneumonie (infection du poumon) se traite le plus souvent par antibiotiques, avec repos et hydratation. Le pneumologue évalue la gravité et décide d'un traitement à domicile ou d'une hospitalisation si l'oxygénation est insuffisante ou si le terrain est fragile. Une radiographie de contrôle est parfois demandée pour vérifier la guérison. Consultez rapidement si la fièvre et l'essoufflement s'aggravent." },
      { q: "Un pneumologue peut-il aider à arrêter de fumer ?", a: "Oui, l'aide au sevrage tabagique fait partie de la pratique courante du pneumologue. Il évalue votre dépendance, propose un accompagnement et peut prescrire des substituts nicotiniques ou un traitement adapté. Un suivi régulier augmente nettement les chances de réussite. C'est aussi l'occasion de dépister précocement une BPCO ou d'autres atteintes liées au tabac." },
    ],
    essentiel: [
      { value: "300 – 600 MAD", label: "Tarif d'une consultation" },
      { value: "Tuberculose", label: "Dépistage et traitement gratuits" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Asthme et allergies respiratoires",
        body: [
          "L'asthme se manifeste par des crises d'essoufflement, une toux et des sifflements, souvent déclenchés par les allergènes, l'effort ou les infections. Bien contrôlé, il permet une vie normale.",
          "Le pneumologue confirme le diagnostic par une exploration fonctionnelle respiratoire, identifie les facteurs déclenchants et ajuste un traitement de fond pour espacer les crises et éviter les complications.",
        ],
      },
      {
        h: "Tuberculose : reconnaître et traiter",
        body: [
          "La tuberculose, maladie contagieuse touchant surtout les poumons, se manifeste par une toux durable, une fièvre, des sueurs nocturnes et un amaigrissement. Le dépistage précoce limite la transmission.",
          "Au Maroc, le programme national assure un diagnostic et un traitement gratuits. La guérison repose sur la prise régulière et complète des antibiotiques pendant toute la durée prescrite.",
        ],
      },
      {
        h: "BPCO et tabagisme",
        body: [
          "La BPCO est une maladie respiratoire chronique principalement causée par le tabac. Elle réduit progressivement le souffle et reste sous-diagnostiquée tant que la gêne est attribuée à l'âge ou à la cigarette.",
          "Le pneumologue dépiste la BPCO par spirométrie et accompagne le sevrage tabagique, geste le plus efficace pour ralentir la maladie et préserver la fonction pulmonaire.",
        ],
      },
      {
        h: "Apnée du sommeil",
        body: [
          "Le syndrome d'apnées du sommeil provoque des pauses respiratoires nocturnes, un sommeil non réparateur et une somnolence diurne, avec un risque cardiovasculaire accru.",
          "Un enregistrement du sommeil confirme le diagnostic. La prise en charge (appareil de ventilation nocturne, mesures hygiéno-diététiques) améliore nettement l'énergie et la sécurité au quotidien.",
        ],
      },
      {
        h: "Les examens du pneumologue : de la spirométrie au scanner",
        body: [
          "Le diagnostic en pneumologie s'appuie sur plusieurs examens complémentaires. L'exploration fonctionnelle respiratoire (EFR ou spirométrie) mesure la capacité et les débits de vos poumons ; c'est l'examen clé pour confirmer un asthme ou une BPCO et en suivre l'évolution. La radiographie du thorax reste le premier examen d'imagerie, complétée si besoin par un scanner thoracique pour analyser des nodules, une infection ou une suspicion d'embolie. L'oxymétrie, simple mesure au bout du doigt, évalue rapidement le taux d'oxygène dans le sang.",
          "Au Maroc, ces examens sont accessibles aussi bien dans les cabinets et cliniques privés que dans les hôpitaux publics. Une partie des frais peut être prise en charge par l'AMO ou la CNSS selon la cotation ANAM, mais les honoraires du secteur privé restent libres : demandez toujours un devis avant un scanner. Pensez à apporter vos comptes rendus et clichés antérieurs, car la comparaison dans le temps est souvent plus parlante qu'une image isolée pour votre pneumologue.",
        ],
      },
      {
        h: "Reconnaître les urgences respiratoires",
        body: [
          "Certaines situations respiratoires ne peuvent pas attendre une consultation programmée. Un essoufflement d'apparition brutale, une douleur thoracique intense, des lèvres ou des extrémités bleutées, ou l'impossibilité de terminer une phrase sans reprendre son souffle sont des signaux d'alarme. Une crise d'asthme qui ne répond pas au traitement de secours habituel, ainsi qu'un crachat contenant du sang en quantité importante, doivent également conduire à une prise en charge immédiate.",
          "Face à ces signes, appelez sans attendre le SAMU au 15 plutôt que de vous déplacer seul, surtout la nuit ou loin d'une structure de soins. En attendant les secours, installez la personne en position assise, desserrez ses vêtements et gardez le calme pour limiter l'aggravation. Ce réflexe peut être vital dans des situations comme l'embolie pulmonaire ou l'insuffisance respiratoire aiguë. Le suivi régulier chez un pneumologue permet justement d'anticiper ces crises et d'ajuster le traitement de fond.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte une consultation chez un pneumologue au Maroc ?",
      intro:
        "Les honoraires de consultation sont libres ; les explorations sont facturées séparément. Fourchettes indicatives.",
      rows: [
        { label: "Consultation", value: "300 – 600 MAD" },
        { label: "Exploration fonctionnelle respiratoire (spirométrie)", value: "200 – 500 MAD" },
        { label: "Radiographie du thorax", value: "150 – 350 MAD" },
        { label: "Scanner thoracique", value: "1 000 – 2 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Le dépistage et le traitement de la tuberculose sont gratuits dans le cadre du programme national. Les assurés CNSS et AMO bénéficient d'un remboursement partiel sur ordonnance.",
    },
  },

  "radiologie": {
    synonyme: "radiologue",
    description:
      "Le radiologue est le médecin spécialiste de l'imagerie médicale. Il réalise et interprète les examens qui permettent de visualiser l'intérieur du corps : radiographie, échographie, mammographie, scanner (TDM) et IRM. Ces examens sont demandés sur prescription d'un autre médecin pour confirmer un diagnostic, surveiller une maladie ou guider un traitement. Le radiologue ne se consulte donc pas en première intention : on prend rendez-vous dans un cabinet ou un centre d'imagerie muni de son ordonnance. Au Maroc, l'accès à l'échographie et à la radiographie est large, tandis que le scanner et l'IRM se concentrent dans les grandes villes et les centres spécialisés. Au-delà du diagnostic, la radiologie interventionnelle permet de réaliser certains gestes guidés par l'image (biopsies, infiltrations). Le compte rendu du radiologue, transmis au médecin prescripteur, oriente la suite de la prise en charge.",
    quandConsulter: [
      "Radiographie prescrite après un traumatisme ou une douleur",
      "Échographie de suivi (abdomen, thyroïde, grossesse)",
      "Mammographie de dépistage du cancer du sein",
      "Scanner ou IRM demandés par votre médecin",
      "Bilan d'imagerie avant une intervention",
    ],
    faqs: [
      {
        q: "Quelle différence entre un scanner et une IRM ?",
        a: "Le scanner utilise les rayons X et est rapide, idéal pour les os, le thorax et les urgences. L'IRM utilise un champ magnétique (sans rayons X) et offre une excellente vision des tissus mous, du cerveau et des articulations. Le choix dépend de l'indication précisée par votre médecin.",
      },
      {
        q: "Combien coûte un examen d'imagerie au Maroc ?",
        a: "Une radiographie coûte environ 150 à 350 MAD, une échographie 300 à 600 MAD, un scanner 1 000 à 2 500 MAD et une IRM 2 000 à 4 500 MAD selon la région explorée et le centre. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur présentation de l'ordonnance.",
      },
      {
        q: "Faut-il une ordonnance pour passer un examen radiologique ?",
        a: "Oui, les examens d'imagerie sont réalisés sur prescription médicale, qui précise la zone à explorer et la question posée. Cette ordonnance est indispensable à la fois pour l'examen et pour le remboursement.",
      },
      {
        q: "Comment prendre rendez-vous dans un centre de radiologie au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Radiologie » et votre ville pour trouver un radiologue ou un centre d'imagerie, consulter les avis et réserver en ligne gratuitement, votre ordonnance à la main.",
      },
    ],
    essentiel: [
      { value: "Sur prescription", label: "Examens d'imagerie" },
      { value: "150 – 4 500 MAD", label: "Selon l'examen" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "Quel examen pour quelle situation ?",
        body: [
          "La radiographie explore surtout les os et le thorax ; l'échographie, sans rayons, observe les organes, la thyroïde, le suivi de grossesse. Le scanner offre des coupes détaillées rapides, l'IRM excelle sur le cerveau, la moelle et les articulations.",
          "C'est le médecin prescripteur qui choisit l'examen le plus adapté à la question clinique. Le radiologue peut toutefois réorienter vers un examen complémentaire si l'image le justifie.",
        ],
      },
      {
        h: "Imagerie et irradiation : faut-il s'inquiéter ?",
        body: [
          "La radiographie et le scanner utilisent des rayons X à des doses maîtrisées. L'échographie et l'IRM, elles, n'irradient pas. Les examens ne sont prescrits que lorsque leur bénéfice dépasse largement le risque.",
          "Signalez toujours une grossesse possible avant un examen irradiant. Le radiologue adapte alors le protocole ou propose une alternative sans rayons.",
        ],
      },
      {
        h: "Mammographie et dépistage du cancer du sein",
        body: [
          "La mammographie est l'examen de référence pour dépister le cancer du sein, recommandé périodiquement chez la femme à partir de 40-50 ans ou plus tôt en cas d'antécédents familiaux.",
          "Le dépistage permet de détecter des lésions très précoces, à un stade où le traitement est plus simple et le pronostic excellent. Le radiologue complète si besoin par une échographie mammaire.",
        ],
      },
      {
        h: "Le compte rendu et la suite de la prise en charge",
        body: [
          "Après l'examen, le radiologue rédige un compte rendu interprétant les images, transmis à vous et à votre médecin. Les images (clichés ou CD) vous sont remises.",
          "Ce compte rendu oriente la décision médicale : surveillance, examen complémentaire ou traitement. Conservez vos examens antérieurs, ils permettent de comparer et d'apprécier une évolution.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte un examen d'imagerie au Maroc ?",
      intro:
        "Les tarifs sont libres et dépendent de l'examen, de la région explorée et du centre. Fourchettes indicatives par examen.",
      rows: [
        { label: "Radiographie", value: "150 – 350 MAD" },
        { label: "Échographie", value: "300 – 600 MAD" },
        { label: "Mammographie", value: "400 – 800 MAD" },
        { label: "Scanner (TDM)", value: "1 000 – 2 500 MAD" },
        { label: "IRM", value: "2 000 – 4 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des examens prescrits sur présentation de l'ordonnance.",
    },
  },

  "anesthesie-reanimation": {
    synonyme: "anesthésiste-réanimateur",
    synonymePluriel: "anesthésistes-réanimateurs",
    description:
      "L'anesthésiste-réanimateur est le médecin qui endort et surveille le patient pendant une intervention chirurgicale, puis assure sa sécurité au réveil. Son rôle commence avant l'opération, lors de la consultation pré-anesthésique obligatoire : il évalue l'état de santé, les antécédents et les traitements, choisit le type d'anesthésie (générale, locorégionale, péridurale) et explique son déroulement. Pendant l'intervention, il contrôle en continu les fonctions vitales. Il intervient aussi en réanimation et en soins intensifs auprès des patients en situation critique, ainsi que dans la prise en charge de la douleur. On ne consulte donc pas un anesthésiste en accès libre comme un autre spécialiste : la rencontre est liée à une chirurgie programmée ou à une hospitalisation. Au Maroc, la consultation pré-anesthésique est une étape de sécurité incontournable de tout parcours chirurgical.",
    quandConsulter: [
      "Consultation pré-anesthésique avant une chirurgie programmée",
      "Préparation à un accouchement (péridurale)",
      "Évaluation des risques liés à l'anesthésie",
      "Prise en charge de la douleur chronique ou post-opératoire",
      "Information sur le type d'anesthésie prévu",
    ],
    faqs: [
      {
        q: "Pourquoi une consultation pré-anesthésique avant une opération ?",
        a: "Elle est obligatoire et essentielle à la sécurité : l'anesthésiste évalue votre état de santé, vos antécédents et vos traitements, choisit le type d'anesthésie le plus sûr et vous explique le jeûne et les consignes à respecter. Elle a lieu quelques jours avant l'intervention programmée.",
      },
      {
        q: "Combien coûte une consultation pré-anesthésique au Maroc ?",
        a: "Une consultation pré-anesthésique coûte généralement entre 200 et 500 MAD. Les honoraires d'anesthésie de l'intervention elle-même sont intégrés au coût opératoire global ; les assurés CNSS ou AMO bénéficient d'une prise en charge partielle sur dossier.",
      },
      {
        q: "Quelle différence entre anesthésie générale et locorégionale ?",
        a: "L'anesthésie générale endort complètement le patient. L'anesthésie locorégionale (rachianesthésie, péridurale, bloc) n'insensibilise qu'une partie du corps, le patient restant éveillé. Le choix dépend de l'intervention et de votre état de santé.",
      },
      {
        q: "Comment prendre rendez-vous avec un anesthésiste au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Anesthésie-réanimation » et votre ville pour trouver un anesthésiste-réanimateur, consulter les avis et réserver votre consultation pré-anesthésique en ligne gratuitement.",
      },
    ],
    essentiel: [
      { value: "Avant chirurgie", label: "Consultation pré-anesthésique" },
      { value: "200 – 500 MAD", label: "Tarif de la consultation" },
      { value: "Obligatoire", label: "Étape de sécurité" },
    ],
    sections: [
      {
        h: "La consultation pré-anesthésique, étape clé de votre opération",
        body: [
          "Quelques jours avant une intervention programmée, l'anesthésiste vous reçoit pour évaluer votre état général, vos allergies, vos traitements et d'éventuels examens à compléter. C'est un rendez-vous de sécurité, distinct de la consultation du chirurgien.",
          "Il vous explique le type d'anesthésie, les règles de jeûne et la gestion de vos médicaments habituels. C'est le moment de poser vos questions sur le déroulement et le réveil.",
        ],
      },
      {
        h: "Les différents types d'anesthésie",
        body: [
          "L'anesthésie générale plonge le patient dans un sommeil contrôlé pendant toute l'intervention. L'anesthésie locorégionale n'endort qu'une zone du corps : rachianesthésie et péridurale pour le bas du corps, blocs nerveux pour un membre.",
          "Le choix est fait par l'anesthésiste en fonction du type de chirurgie, de votre santé et de vos préférences, dans un objectif de confort et de sécurité maximaux.",
        ],
      },
      {
        h: "Réanimation et soins intensifs",
        body: [
          "Au-delà du bloc opératoire, l'anesthésiste-réanimateur prend en charge les patients en état critique en réanimation et en soins intensifs : défaillances d'organes, suites de chirurgies lourdes, urgences vitales.",
          "Il y surveille et soutient les fonctions vitales (respiration, circulation) à l'aide d'équipements spécialisés, en lien avec les autres spécialistes.",
        ],
      },
      {
        h: "La prise en charge de la douleur",
        body: [
          "L'anesthésiste joue un rôle central dans le traitement de la douleur, en post-opératoire comme dans certaines douleurs chroniques rebelles.",
          "Il propose des techniques adaptées (médicaments, infiltrations, blocs) pour soulager efficacement, améliorer la récupération après une opération et préserver la qualité de vie.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte l'anesthésie au Maroc ?",
      intro:
        "La consultation pré-anesthésique est facturée à part ; les honoraires d'anesthésie de l'intervention sont intégrés au coût opératoire. Fourchettes indicatives.",
      rows: [
        { label: "Consultation pré-anesthésique", value: "200 – 500 MAD" },
        { label: "Honoraires d'anesthésie (intervention)", value: "Inclus dans le forfait chirurgical" },
        { label: "Péridurale pour accouchement", value: "1 500 – 4 000 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les actes d'anesthésie sont pris en charge partiellement par la CNSS et l'AMO dans le cadre du dossier d'hospitalisation.",
    },
  },

  "biologie-medicale": {
    synonyme: "biologiste médical",
    synonymePluriel: "biologistes médicaux",
    description:
      "Le biologiste médical dirige le laboratoire d'analyses médicales et garantit la fiabilité des examens biologiques : prises de sang, analyses d'urine, bilans hormonaux, sérologies, examens microbiologiques. Ces analyses, le plus souvent prescrites par un médecin, sont essentielles pour poser un diagnostic, dépister une maladie ou surveiller un traitement (diabète, cholestérol, fonction rénale, infections). On ne consulte pas le biologiste comme un médecin clinicien : on se rend au laboratoire muni de son ordonnance, à jeun si l'examen l'exige. Le biologiste valide les résultats, les interprète sur le plan technique et alerte le médecin prescripteur en cas de valeur critique. Au Maroc, les laboratoires d'analyses sont nombreux et accessibles dans toutes les villes. Certains examens simples (glycémie, groupe sanguin) peuvent être réalisés sans ordonnance, mais l'interprétation médicale reste du ressort de votre médecin.",
    quandConsulter: [
      "Bilan sanguin prescrit par votre médecin",
      "Suivi d'une maladie chronique (diabète, cholestérol)",
      "Recherche d'une infection (sérologie, prélèvement)",
      "Bilan de grossesse ou bilan pré-opératoire",
      "Contrôle de la fonction rénale, hépatique ou thyroïdienne",
    ],
    faqs: [
      {
        q: "Faut-il une ordonnance pour faire des analyses ?",
        a: "La plupart des analyses sont réalisées sur prescription médicale, qui est aussi nécessaire au remboursement. Quelques examens simples peuvent être effectués sans ordonnance, mais leur interprétation doit être confiée à votre médecin.",
      },
      {
        q: "Combien coûte un bilan sanguin au Maroc ?",
        a: "Une prise de sang simple coûte quelques dizaines de dirhams par paramètre ; un bilan courant (glycémie, cholestérol, numération) revient généralement à 150 à 500 MAD selon les analyses demandées. Les assurés CNSS ou AMO bénéficient d'un remboursement partiel sur ordonnance.",
      },
      {
        q: "Faut-il être à jeun pour une prise de sang ?",
        a: "Cela dépend des analyses : la glycémie et le bilan lipidique nécessitent un jeûne de 8 à 12 heures, d'autres non. Le laboratoire vous indique les conditions précises au moment de la prise de rendez-vous.",
      },
      {
        q: "Comment trouver un laboratoire d'analyses au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Biologie médicale » et votre ville pour trouver un laboratoire ou un biologiste, consulter les avis et organiser votre prélèvement, votre ordonnance à la main.",
      },
    ],
    essentiel: [
      { value: "Sur prescription", label: "Analyses médicales" },
      { value: "150 – 500 MAD", label: "Bilan sanguin courant" },
      { value: "CNSS · AMO", label: "Remboursement partiel" },
    ],
    sections: [
      {
        h: "À quoi servent les analyses médicales ?",
        body: [
          "Les analyses biologiques mesurent des paramètres du sang, des urines ou d'autres prélèvements pour objectiver l'état de l'organisme : sucre, cholestérol, fonction rénale, hormones, marqueurs d'infection ou d'inflammation.",
          "Elles complètent l'examen clinique du médecin et sont indispensables au diagnostic et au suivi de très nombreuses maladies, souvent silencieuses à leur début.",
        ],
      },
      {
        h: "Bien se préparer à une prise de sang",
        body: [
          "Selon les analyses, un jeûne de 8 à 12 heures peut être requis (glycémie, bilan lipidique). Buvez de l'eau, signalez vos traitements et respectez l'horaire conseillé pour certains dosages hormonaux.",
          "Le laboratoire vous précise les conditions au rendez-vous. Une bonne préparation garantit des résultats fiables et évite d'avoir à refaire le prélèvement.",
        ],
      },
      {
        h: "Comprendre ses résultats",
        body: [
          "Les résultats indiquent vos valeurs en regard de valeurs de référence. Une valeur hors norme n'est pas toujours inquiétante : elle s'interprète selon le contexte, l'âge, le sexe et l'ensemble du bilan.",
          "Seul votre médecin prescripteur pose le diagnostic et décide de la conduite à tenir. Le biologiste, lui, garantit la qualité technique et signale les valeurs critiques.",
        ],
      },
      {
        h: "Dépistage et suivi des maladies chroniques",
        body: [
          "La biologie joue un rôle clé dans le dépistage du diabète, des troubles du cholestérol ou de la fonction rénale, fréquents au Maroc et souvent asymptomatiques au début.",
          "Pour les maladies chroniques, des bilans réguliers permettent d'ajuster les traitements et de prévenir les complications. La régularité du suivi est aussi importante que le traitement lui-même.",
        ],
      },
    ],
    prix: {
      title: "Combien coûtent les analyses médicales au Maroc ?",
      intro:
        "Les tarifs dépendent du nombre et du type d'analyses demandées. Fourchettes indicatives pour des examens courants.",
      rows: [
        { label: "Prise de sang (acte de prélèvement)", value: "30 – 80 MAD" },
        { label: "Glycémie à jeun", value: "30 – 60 MAD" },
        { label: "Bilan lipidique (cholestérol)", value: "100 – 200 MAD" },
        { label: "Numération formule sanguine (NFS)", value: "60 – 120 MAD" },
        { label: "Bilan sanguin complet courant", value: "150 – 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des analyses prescrites sur présentation de l'ordonnance.",
    },
  },

  "anatomo-pathologie": {
    synonyme: "anatomopathologiste",
    description:
      "L'anatomopathologiste (ou pathologiste) est le médecin qui examine au microscope les tissus et cellules prélevés sur un patient — biopsies, pièces opératoires, frottis — afin d'établir un diagnostic précis. C'est une spécialité essentielle mais peu connue du grand public, car le patient ne la consulte pas directement : l'examen est demandé par le médecin ou le chirurgien qui a réalisé le prélèvement, et le pathologiste lui transmet son compte rendu. Son rôle est déterminant dans le diagnostic des cancers : c'est lui qui confirme la nature d'une tumeur (bénigne ou maligne), précise son type et son agressivité, et oriente ainsi le traitement. Au Maroc, l'anatomopathologie est réalisée dans des laboratoires spécialisés, souvent situés dans les grandes villes. La qualité et le délai de ce diagnostic conditionnent toute la prise en charge ultérieure, en particulier en cancérologie.",
    quandConsulter: [
      "Analyse d'une biopsie réalisée par votre médecin",
      "Examen d'une pièce opératoire après une intervention",
      "Frottis cervico-utérin (dépistage)",
      "Confirmation de la nature d'une tumeur ou d'un nodule",
      "Recherche demandée dans le cadre d'un bilan de cancer",
    ],
    faqs: [
      {
        q: "Le patient consulte-t-il directement un anatomopathologiste ?",
        a: "Non. L'anatomopathologiste analyse les prélèvements transmis par le médecin ou le chirurgien et lui adresse son compte rendu. C'est votre médecin qui vous explique ensuite les résultats et la conduite à tenir.",
      },
      {
        q: "Combien coûte un examen anatomopathologique au Maroc ?",
        a: "Le coût dépend de la complexité de l'analyse : comptez généralement entre 300 et 1 500 MAD pour l'examen d'une biopsie, davantage si des techniques complémentaires (immunohistochimie) sont nécessaires. Les assurés CNSS ou AMO bénéficient d'une prise en charge partielle sur dossier.",
      },
      {
        q: "Combien de temps pour obtenir les résultats d'une biopsie ?",
        a: "Le délai varie généralement de quelques jours à deux semaines selon la technique et le laboratoire. Les analyses complexes ou nécessitant des examens complémentaires peuvent demander plus de temps.",
      },
      {
        q: "Comment trouver un laboratoire d'anatomopathologie au Maroc ?",
        a: "Sur SantéauMaroc, filtrez par spécialité « Anatomo-pathologie » et votre ville pour localiser un laboratoire spécialisé. En pratique, c'est le plus souvent votre médecin qui adresse directement les prélèvements.",
      },
    ],
    essentiel: [
      { value: "Sur prélèvement", label: "Analyse de tissus/cellules" },
      { value: "Diagnostic du cancer", label: "Rôle déterminant" },
      { value: "Via le médecin", label: "Pas d'accès direct patient" },
    ],
    sections: [
      {
        h: "Le rôle clé du pathologiste dans le diagnostic",
        body: [
          "En examinant les tissus au microscope, l'anatomopathologiste pose le diagnostic de certitude que l'imagerie ou la clinique ne peuvent à elles seules apporter. Il distingue le bénin du malin et caractérise précisément une lésion.",
          "Son compte rendu est la pièce maîtresse de nombreux diagnostics, en particulier en cancérologie, où il conditionne le type de traitement proposé.",
        ],
      },
      {
        h: "Biopsie, pièce opératoire et frottis",
        body: [
          "La biopsie prélève un petit fragment de tissu pour analyse ; la pièce opératoire correspond à ce qui a été retiré lors d'une intervention ; le frottis recueille des cellules, comme le frottis cervico-utérin de dépistage.",
          "Chacun de ces prélèvements est analysé selon des protocoles précis. Le pathologiste peut recourir à des colorations et techniques spéciales pour affiner le diagnostic.",
        ],
      },
      {
        h: "Anatomopathologie et cancérologie",
        body: [
          "Le diagnostic d'un cancer repose presque toujours sur l'analyse anatomopathologique : type de tumeur, degré d'agressivité, marges d'exérèse, présence de récepteurs ciblés par certains traitements.",
          "Ces informations guident l'oncologue et le chirurgien dans le choix de la stratégie thérapeutique. La qualité et la rapidité de cette analyse sont donc cruciales pour le patient.",
        ],
      },
      {
        h: "Délais et techniques complémentaires",
        body: [
          "Au-delà de l'examen standard, des techniques complémentaires (immunohistochimie, biologie moléculaire) précisent le diagnostic et la sensibilité à certains traitements ciblés.",
          "Ces analyses allongent parfois le délai de réponse, mais elles sont déterminantes pour une prise en charge personnalisée. Votre médecin vous tient informé de l'avancement.",
        ],
      },
    ],
    prix: {
      title: "Combien coûte un examen anatomopathologique au Maroc ?",
      intro:
        "Les tarifs dépendent de la nature du prélèvement et des techniques utilisées. Fourchettes indicatives.",
      rows: [
        { label: "Examen d'une biopsie", value: "300 – 1 500 MAD" },
        { label: "Examen cytologique (frottis)", value: "150 – 400 MAD" },
        { label: "Immunohistochimie (complément)", value: "À partir de 500 MAD" },
      ],
      note: "Tarifs donnés à titre indicatif (2026). Les assurés CNSS et AMO bénéficient d'un remboursement partiel des examens prescrits dans le cadre du dossier de soins.",
    },
  },

};

const DEFAULT_CONTENT: SpecialtyContent = {
  synonyme: "spécialiste",
  description: "",
  quandConsulter: [],
  faqs: [
    {
      q: "Comment trouver un spécialiste au Maroc ?",
      a: "SantéauMaroc répertorie des milliers de praticiens vérifiés au Maroc. Filtrez par spécialité et ville, consultez les avis patients et prenez rendez-vous en ligne gratuitement.",
    },
    {
      q: "Comment prendre rendez-vous en ligne sur SantéauMaroc ?",
      a: "Sélectionnez un praticien, consultez ses disponibilités et cliquez sur « Prendre rendez-vous ». La confirmation est immédiate, sans frais supplémentaires.",
    },
  ],
};

/* ── Versions arabes ──────────────────────────────────────── */

const SPECIALTY_CONTENT_AR: Record<string, SpecialtyContentAr> = {
  "acupuncture": {
    reviewed: "2026-07-05",
    description:
      "الوخز بالإبر ممارسة من الطب التكميلي، أصلها الطب الصيني التقليدي، وتقوم على تنبيه نقاط محدّدة من الجسم بواسطة إبر رفيعة معقّمة تُستعمل مرة واحدة. وبالمغرب يمارسه في الغالب أطباء تلقّوا تكوينًا في هذه التقنية، ويأتي كتكملة — لا كبديل — للتكفّل الطبي التقليدي. وقد دُرس خصوصًا في تخفيف بعض الآلام المزمنة (آلام أسفل الظهر، آلام الرقبة، خشونة الركبة)، والشقيقة وصداع التوتر، والغثيان، والاضطرابات الوظيفية المرتبطة بالتوتر. ويبدأ المعالِج دائمًا باستجواب وفحص لاستبعاد سبب يستوجب علاجًا طبيًا محدّدًا قبل اقتراح خطة جلسات. وتشير المعطيات العلمية إلى فائدة في عدد من هذه الحالات، لكن الوخز بالإبر لا يعوّض تشخيصًا طبيًا ولا علاجًا موصوفًا.",
    quandConsulter: [
      "آلام مزمنة: أسفل الظهر، الرقبة، خشونة المفاصل",
      "شقيقة وصداع توتر متكرّران",
      "توتر أو قلق أو اضطرابات النوم",
      "غثيان مرتبط بالحمل أو بعملية جراحية أو بالعلاج الكيميائي",
      "مواكبة الإقلاع عن التدخين",
    ],
    faqs: [
      {
        q: "هل الوخز بالإبر فعّال؟",
        a: "تُظهر المعطيات العلمية فائدة في عدة حالات، خصوصًا بعض الآلام المزمنة (أسفل الظهر، الرقبة، خشونة الركبة)، والشقيقة، والغثيان. ويختلف الأثر من شخص لآخر ومن حالة لأخرى. ويُقترح الوخز بالإبر كتكملة لمتابعة طبية، ولا يعوّض تشخيصًا ولا علاجًا موصوفًا.",
      },
      {
        q: "هل جلسة الوخز بالإبر مؤلمة؟",
        a: "الإبر المستعملة رفيعة جدًا، أدقّ بكثير من إبرة الحقن. والغرز غير مؤلم عمومًا؛ وقد يشعر بعض المرضى بوخز خفيف أو إحساس بالثقل أو الدفء في موضع الغرز، وهو إحساس عابر وحميد.",
      },
      {
        q: "كم عدد الجلسات اللازمة؟",
        a: "يتوقّف ذلك على السبب وعلى استجابتك للعلاج. فبالنسبة لألم مزمن، كثيرًا ما تلزم عدة جلسات (غالبًا من 4 إلى 6) موزّعة على بضعة أسابيع، مع إعادة تقييم منتظمة. ويكيّف المعالِج عدد الجلسات وإيقاعها حسب وضعيتك.",
      },
      {
        q: "كم تكلّف جلسة الوخز بالإبر بالمغرب؟",
        a: "يتراوح ثمن الجلسة عمومًا بين 200 و500 درهم حسب المدينة والممارس، وقد تكون الاستشارة الأولى (الحصيلة) أعلى قليلًا. والأتعاب حرّة بالمغرب؛ ويتوقّف الاسترجاع من CNSS أو AMO أو التعاضدية على عقدك وليس تلقائيًا.",
      },
      {
        q: "هل للوخز بالإبر مخاطر أو موانع؟",
        a: "عند ممارسته من مهني مكوَّن بإبر معقّمة تُستعمل مرة واحدة، يكون الوخز بالإبر جيّد التحمّل عمومًا. والآثار الجانبية نادرة وحميدة (نزيف خفيف، ورم دموي صغير، تعب عابر). أخبِر دائمًا عن الحمل، أو تناول مضادات التخثّر أو اضطراب في التخثّر، أو نقص المناعة، أو حمل جهاز تنظيم ضربات القلب (في حالة الوخز الكهربائي). وعند ألم في الصدر أو توعّك أو أي علامة طارئة، استشر طبيبًا أو المستعجلات، لا معالِجًا بالوخز.",
      },
      {
        q: "كيف أحجز موعدًا مع معالِج بالوخز بالإبر بالمغرب؟",
        a: "على صحة بالمغرب، صفِّ حسب تخصص « الوخز بالإبر » واختر مدينتك. اطّلع على الملفات وآراء المرضى والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا، دون رسوم تسجيل.",
      },
      { q: "هل الوخز بالإبر مُغطّى من طرف CNSS أو AMO في المغرب؟", a: "في الحالة العامة، لا يُدرَج الوخز بالإبر ضمن سلة العلاجات القابلة للاسترجاع في إطار التأمين الإجباري عن المرض AMO الذي تديره CNSS، وبالتالي لا يدخل في التسعيرة الوطنية المرجعية (TNR/ANAM). تبقى الحصص غالبًا على نفقتك الخاصة. قد تقترح بعض التأمينات التكميلية أو التعاضديات الخاصة صيغة جزافية لـ«الطب البديل»: استفسر لدى مؤسستك واطلب من المُعالِج فاتورة مفصّلة." },
      { q: "هل يمكن اللجوء إلى الوخز بالإبر أثناء الحمل في المغرب؟", a: "يمكن التفكير في الوخز بالإبر أثناء الحمل لبعض المضايقات (الغثيان، آلام أسفل الظهر)، لكن فقط مع مُعالِج على علم بحالتك، لأن عدة نقاط ممنوعة وقد تُحفّز الرحم. أخبِري دائمًا بحملك منذ حجز الموعد. وهو لا يُغني إطلاقًا عن المتابعة التوليدية لدى طبيب النساء أو القابلة." },
      { q: "كيف تتحقق من جدية مُعالِج بالوخز بالإبر في المغرب؟", a: "تحقّق من تكوين المُعالِج، وإن كان طبيبًا أو مهنيًا صحيًا، من تسجيله في الهيئة المهنية المناسبة. تأكّد من استعماله حصريًا لإبر معقّمة ذات استعمال واحد، تُفتح أمامك من غلافها المختوم. المُعالِج الجاد يسألك عن سوابقك المرضية وعلاجاتك، ويوجّهك إلى طبيب إذا استدعت أعراضك ذلك. على SantéauMaroc، اطّلع على الملف والآراء قبل الحجز." },
    ],
    essentiel: [
      { value: "200 – 500 درهم", label: "ثمن إرشادي للجلسة" },
      { value: "عدة جلسات", label: "غالبًا ضرورية" },
      { value: "كتكملة", label: "لا يعوّض العلاج" },
    ],
    sections: [
      {
        h: "كيف تجري جلسة الوخز بالإبر؟",
        body: [
          "تبدأ الجلسة الأولى باستجواب مفصّل (السبب، السوابق، العلاجات الجارية، نمط الحياة) وفحص سريري. وتتيح هذه المرحلة للمعالِج فهم وضعيتك والتأكّد من عدم وجود علامة تستوجب أولًا تكفّلًا طبيًا محدّدًا.",
          "ثم تُمدَّد في وضعية مريحة. ويغرز الممارس إبرًا رفيعة معقّمة تُستعمل مرة واحدة في نقاط محدّدة، يتركها نحو 20 إلى 30 دقيقة. والإحساس المصاحب خفيف عمومًا: وخز أو ثقل أو دفء. وتدوم الجلسة غالبًا بين 30 و45 دقيقة.",
        ],
      },
      {
        h: "ماذا يمكن أن يخفّف الوخز بالإبر؟ الدواعي والمعطيات العلمية",
        body: [
          "دُرس الوخز بالإبر خصوصًا في التكفّل ببعض الآلام المزمنة — أسفل الظهر، الرقبة، خشونة الركبة —، والشقيقة وصداع التوتر، والغثيان (الحمل، بعد عملية، العلاج الكيميائي)، والمظاهر المرتبطة بالتوتر والقلق واضطرابات النوم. ويُقترح أحيانًا كمواكبة للإقلاع عن التدخين.",
          "وتشير المعطيات العلمية إلى فائدة حقيقية في عدد من هذه الحالات، لكن الأثر يبقى متفاوتًا بين الأشخاص. ويعمل الوخز بالإبر كتكملة: فهو لا يعالج سبب المرض ولا يعوّض تشخيصًا طبيًا أو علاجًا موصوفًا. وأمام أي عرض مستمرّ أو جديد أو مقلق، يبقى التقييم الطبي ضروريًا.",
        ],
      },
      {
        h: "السلامة والاحتياطات والموانع",
        body: [
          "يُعدّ الوخز بالإبر آمنًا عند إنجازه من ممارس مكوَّن، بإبر معقّمة تُستعمل مرة واحدة. والآثار الجانبية نادرة وحميدة في الغالب: نزيف خفيف أو ورم دموي صغير في موضع الغرز، تعب أو إحساس بالاسترخاء عابر بعد الجلسة.",
          "وتفرض بعض الحالات يقظة خاصة: الحمل، تناول مضادات التخثّر أو اضطراب في التخثّر، نقص المناعة، عدوى أو إصابة جلدية، حمل جهاز تنظيم ضربات القلب في حالة الوخز الكهربائي. أخبِر بها معالِجك دائمًا. وأخيرًا، الوخز بالإبر غير مناسب أبدًا لحالة طارئة: أمام ألم في الصدر أو ضيق نفس مفاجئ أو توعّك أو نزيف غزير، اتصل بطبيب أو بالمستعجلات (15 / 141).",
        ],
      },
      {
        h: "قبل الجلسة وبعدها: نصائح عملية",
        body: [
          "قبل الجلسة، تجنّب الحضور على معدة فارغة: تناول وجبة خفيفة وحافظ على ترطيب جيّد. واصطحب فحوصك ووصفاتك الحديثة، وأخبِر الممارس بعلاجاتك الجارية وبحمل محتمل أو بأي مشكل صحي خاص.",
          "بعد الجلسة، يشيع إحساس بالتعب أو الاسترخاء وهو عابر: اشرب الماء وامنح نفسك لحظة راحة إن أمكن. وقد تظهر الآثار تدريجيًا في الأيام الموالية. وعند ردّ فعل غير معتاد أو مستمرّ، تحدّث إلى معالِجك أو طبيبك المعالِج.",
        ],
      },
      {
        h: "الوخز بالإبر والطب التقليدي: مقاربة تكميلية",
        body: [
          "يندرج الوخز بالإبر ضمن مقاربة تكميلية: فقد يحسّن الراحة ويخفّف بعض الأعراض، بموازاة متابعة طبية، لا بدلًا عنها. وهو لا يغني أبدًا عن تشخيص يضعه طبيب.",
          "أخبِر طبيبك المعالِج بالجلسات التي تنوي القيام بها، خصوصًا إن كنت تتبع علاجًا لمرض مزمن. ولا توقف أبدًا علاجًا موصوفًا دون رأي طبي. ويضمن هذا التنسيق تكفّلًا متماسكًا وآمنًا.",
        ],
      },
      {
        h: "مُعالِج بالوخز طبيب أو غير طبيب: ما يقوله الإطار المغربي",
        body: [
          "في المغرب، يُمارَس الوخز بالإبر من طرف أطباء تابعوا تكوينًا تكميليًا وكذلك من طرف مُعالِجين غير أطباء. هذا التمييز مهم: وحده الطبيب يمكنه وضع تشخيص طبي، وطلب فحوصات أو وصف أدوية، وتأويل حصيلة طبية. أما المُعالِج غير الطبيب فيقترح تكفّلًا مبنيًا على مقاربة الطب الصيني التقليدي ولا يحلّ بأي حال محل الرأي الطبي.",
          "أيًا كانت صفته، يبقى المُعالِج الجاد ضمن مجال اختصاصه ويوجّهك إلى طبيب أمام أي عرض إنذاري: ألم في الصدر، حمى مستمرة، فقدان وزن غير مُفسَّر، اضطراب عصبي. في حالة الطوارئ المهدِّدة للحياة، اتصل فورًا بالرقم 15 (SAMU) دون انتظار حصة. يندرج الوخز بالإبر كمُكمِّل لمتابعة طبية، وليس أبدًا كعلاج بديل لمرض مُشخَّص.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف جلسة الوخز بالإبر بالمغرب؟",
      intro:
        "الأتعاب حرّة بالمغرب وتختلف حسب المدينة وخبرة الممارس ونوع الجلسة. وفيما يلي فئات أسعار إرشادية مُلاحَظة.",
      rows: [
        { label: "جلسة متابعة (المدن الكبرى)", value: "300 – 500 درهم" },
        { label: "جلسة متابعة (المدن المتوسطة)", value: "200 – 400 درهم" },
        { label: "استشارة أولى مع حصيلة", value: "300 – 600 درهم" },
        { label: "صيغة عدة جلسات", value: "كثيرًا ما تُقترح، حسب عرض الأثمان" },
      ],
      note: "أسعار إرشادية (2026). يتوقّف الاسترجاع من CNSS أو AMO أو التعاضدية على عقدك وليس تلقائيًا بالنسبة للوخز بالإبر.",
    },
  },

  "nephrologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الكلى هو الطبيب المختص في أمراض الكلى. في المغرب، يتكفل بالقصور الكلوي الحاد والمزمن، وارتفاع ضغط الدم ذي الأصل الكلوي، والبيلة البروتينية، والحصى، والتهابات الكلى، والمتابعة الكلوية لداء السكري، وهو مرض منتشر جدًا في البلاد. لا ينبغي الخلط بينه وبين طبيب المسالك البولية، وهو جرّاح الجهاز البولي. كما ينسّق طبيب الكلى عملية التصفية (الدياليز) ويهيّئ، مع فريق زرع الأعضاء، المرضى في المرحلة النهائية من القصور الكلوي. تتم استشارته في القطاع العام (المراكز الاستشفائية الجامعية، المستشفيات الجهوية، مراكز تصفية الدم) وفي القطاع الخاص (العيادات في المدن الكبرى). الأتعاب حرة في القطاع الخاص وتختلف حسب المدينة وسمعة الطبيب. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للاستشارة والفحوصات، وفق التعريفة الوطنية المرجعية TNR. يساعدك SantéauMaroc في العثور على طبيب كلى موثوق قربك وحجز موعد عبر الإنترنت مجانًا.",
    quandConsulter: [
      "أنت مصاب بالسكري أو ارتفاع ضغط الدم واكتشف طبيبك تراجعًا في وظيفة الكلى أو بيلة بروتينية.",
      "أظهر تحليل الدم ارتفاعًا في الكرياتينين أو انخفاضًا في معدل الترشيح الكبيبي (DFG).",
      "لديك دم أو رغوة مستمرة في البول، أو تورّم في الساقين والوجه (وذمات).",
      "تعاني من حصى كلوية متكررة أو التهابات بولية عليا متكررة.",
      "أنت في حالة قصور كلوي وتحتاج إلى تنظيم المتابعة أو تصفية الدم أو مشروع زرع كلية.",
    ],
    faqs: [
      { q: "ما الفرق بين طبيب الكلى وطبيب المسالك البولية في المغرب؟", a: "طبيب الكلى هو طبيب يعالج أمراض الكلى بالوسائل الطبية: القصور الكلوي، وارتفاع ضغط الدم الكلوي، والبيلة البروتينية، وتصفية الدم. أما طبيب المسالك البولية فهو جرّاح الجهاز البولي (البروستات، المثانة، الحصى التي تتطلب جراحة). ويمكن أن يتعاون الطبيبان، مثلاً في حالة مريض يعاني من حصى كلوية." },
      { q: "كم تكلّف استشارة طبيب الكلى في المغرب؟", a: "في القطاع الخاص، الأتعاب حرة. احتسب في المتوسط ما بين 300 و500 درهم في المدن الكبرى (الدار البيضاء، الرباط، مراكش) وما بين 250 و400 درهم في المدن الأخرى. في القطاع العام (المراكز الاستشفائية، المستشفيات) يكون التعريفة أقل. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "كيف أحجز موعدًا مع طبيب كلى في المغرب؟", a: "على SantéauMaroc، صفِّ حسب تخصص «طب الكلى» وحسب المدينة لعرض الأطباء القريبين منك. تطّلع على معلوماتهم ولغاتهم وأوقات توفرهم، ثم تحجز عبر الإنترنت مجانًا. غالبًا ما تكون رسالة توجيه من طبيبك المعالج مفيدة في الاستشارة الأولى." },
      { q: "هل تصفية الدم مشمولة بالتغطية في المغرب؟", a: "تصفية الدم المزمنة مشمولة بالتكفل لدى المؤمَّنين لدى CNSS وAMO وكذلك عبر النظام الموجّه للأشخاص المعوزين، وفق الشروط المعمول بها. وتُمارس في مراكز عامة وخاصة متعاقدة. يوجّهك طبيب الكلى نحو المركز الأنسب لوضعيتك." },
      { q: "هل يمكن للسكري أن يُتلف الكلى؟", a: "نعم، يُعدّ السكري من الأسباب الرئيسية للقصور الكلوي في المغرب. وقد يؤدي إلى اعتلال الكلية السكري، الذي يكون صامتًا في البداية غالبًا. تتيح المتابعة لدى طبيب الكلى، مع قياس منتظم للكرياتينين والبحث عن البيلة البروتينية، الكشف المبكر وإبطاء تلف الكلى." },
      { q: "ما الفحوصات التي قد يطلبها طبيب الكلى؟", a: "يعتمد على تحاليل الدم (الكرياتينين، DFG، شوارد الدم)، وتحاليل البول (البيلة البروتينية، الرواسب)، وتصوير الكلى بالصدى، وفي بعض الحالات خزعة كلوية. تحدّد هذه الفحوصات سبب المرض ومرحلته من أجل تكييف العلاج." },
      { q: "هل يمكن لمضادات الالتهاب المباعة في الصيدلية أن تضرّ بالكلى؟", a: "نعم، فالتناول المتكرر لمضادات الالتهاب غير الستيرويدية (مثل الإيبوبروفين أو الديكلوفيناك)، وهو شائع جداً في التطبيب الذاتي بالمغرب، قد يُضعف وظيفة الكلى، خاصة لدى المسنّين والمصابين بالسكري أو ارتفاع الضغط أو حالات الجفاف. كما أن بعض المنتجات التقليدية وبعض خلطات الأعشاب قد تكون سامّة للكلى. أخبر طبيب الكلى دائماً بكل دواء أو علاج تتناوله، حتى بدون وصفة طبية." },
      { q: "هل يُعدّ ارتفاع ضغط الدم سبباً لأمراض الكلى بالمغرب؟", a: "نعم، فارتفاع الضغط غير المضبوط يُعدّ، إلى جانب السكري، من أهم أسباب القصور الكلوي بالمغرب. والكلية ضحية لارتفاع الضغط وفاعل فيه في آنٍ واحد، مما يُنشئ حلقة مُفاقِمة. إن التحكّم الجيد في الضغط والمتابعة المنتظمة والعلاج المناسب الذي يصفه الطبيب تُتيح حماية وظيفة الكلى على المدى البعيد." },
      { q: "هل يمكن الصيام في رمضان عند الإصابة بمرض كلوي؟", a: "يتوقف ذلك على مرحلة المرض ونوع العلاج: فبعض مرضى الكلى المستقرّين يمكنهم الصيام، بينما يواجه آخرون (مرضى تصفية الدم، المزروعة لهم كلى، القصور المتقدّم، الحصى المتكرّرة) خطر الجفاف أو اضطرابات التوازن. يجب اتخاذ القرار مع طبيب الكلى قبل رمضان، وليس بشكل فردي. والإسلام يُرخّص بالإفطار عند وجود خطر على الصحة، ويمكن للطبيب تعديل مواعيد تناول الأدوية." },
    ],
    essentiel: [
      { value: "300 – 500 درهم", label: "تعريفة الاستشارة" },
      { value: "الكلى والدياليز", label: "طبيب الكلى، وليس جرّاحًا" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الأمراض التي يتكفل بها طبيب الكلى",
        body: [
          "يعالج طبيب الكلى مجموع أمراض الكلى الطبية: القصور الكلوي الحاد والمزمن، والتهابات الكبيبات الكلوية، واعتلال الكلية السكري وارتفاع ضغط الدم، والبيلة البروتينية، والبيلة الدموية، واضطرابات توازن البوتاسيوم والصوديوم. كما يتكفل بارتفاع ضغط الدم ذي الأصل الكلوي، الصعب التحكّم فيه، وبانعكاسات الأمراض العامة على الكلى.",
          "في المغرب، يُعدّ السكري وارتفاع ضغط الدم، المنتشران بكثرة، السببين الأولين لتلف الكلى. وغالبًا ما يتدخّل طبيب الكلى بعد الطبيب العام أو طبيب السكري، عندما تُظهر التحاليل تدهورًا في وظيفة الكلى، من أجل إبطاء التطور والوقاية من الوصول إلى مرحلة تصفية الدم.",
        ],
      },
      {
        h: "الفحوصات والإجراءات في طب الكلى",
        body: [
          "يعتمد التقييم الكلوي أولاً على تحاليل بسيطة: قياس الكرياتينين مع تقدير معدل الترشيح الكبيبي (DFG)، وشوارد الدم، والبحث عن البروتينات والدم في البول. ويقيّم تصوير الكلى بالصدى حجم الكليتين وشكلهما. توجّه هذه الفحوصات، المتوفرة على نطاق واسع في المغرب، عملية التشخيص.",
          "في بعض الحالات، يجري طبيب الكلى أو يصف خزعة كلوية لتحديد المرض بدقة، أو ينظّم التكفل عبر تصفية الدم. كما يتولى التقييم قبل الزرع ومتابعة المرضى المزروعين، بالتنسيق مع مراكز زرع الأعضاء الجامعية.",
        ],
      },
      {
        h: "الكشف عن مرض الكلى والوقاية منه",
        body: [
          "يتطور مرض الكلى المزمن طويلاً دون أعراض. لذا يُعدّ الكشف أساسيًا لدى الأشخاص المعرّضين للخطر: مرضى السكري، والمصابين بارتفاع ضغط الدم، والمسنين، ومن لديهم سوابق عائلية لمرض الكلى. يتيح قياس بسيط للكرياتينين والبحث عن البيلة البروتينية اكتشافًا مبكرًا.",
          "تمرّ الوقاية عبر التحكم الجيد في الضغط والسكر، والترطيب الكافي، والحدّ من الملح، والحذر من الأدوية السامة للكلى، خصوصًا الاستعمال المتكرر لمضادات الالتهاب. يرافق طبيب الكلى هذه التدابير المتعلقة بنمط الحياة ويكيّف العلاجات لحماية الكلى.",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع في المغرب",
        body: [
          "يبدأ المسار غالبًا لدى الطبيب العام، الذي يوجّه نحو طبيب الكلى في حال وجود خلل في التقييم الكلوي. ويمكن أن تجري الاستشارة في القطاع العام (المراكز الاستشفائية الجامعية، المستشفيات الجهوية) أو في القطاع الخاص. تسهّل رسالة التوجيه التكفل والمتابعة المنسّقة.",
          "يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للاستشارة والفحوصات، على أساس التعريفة الوطنية المرجعية، وعمومًا في حدود 80٪ من TNR لاستشارة أساسية. وتخضع تصفية الدم المزمنة لتكفل خاص في المراكز المتعاقدة.",
        ],
      },
      {
        h: "القصور الكلوي النهائي: تصفية الدم والزرع",
        body: [
          "عندما تتوقف الكلى عن العمل بشكل كافٍ، يقترح طبيب الكلى وسيلة تعويضية: تصفية الدم، التي تُجرى عدة مرات في الأسبوع بالمركز، أو الدياليز البريتوني الذي يمكن إجراؤه في المنزل، أو زرع الكلية، وهو الحل الأفضل على المدى الطويل عندما يكون ممكنًا.",
          "يتوقف الاختيار على حالة المريض ونمط حياته وتوفر عضو للزرع. يهيّئ طبيب الكلى الملف، ويُطلع المريض وعائلته، ويؤمّن المتابعة على المدى الطويل. في حالة الطوارئ (حمى، ألم شديد، إغماء، انقطاع البول)، يجب استشارة الطبيب دون تأخير أو الاتصال بالرقم 15 (SAMU).",
        ],
      },
      {
        h: "الكلى والحياة اليومية بالمغرب: الأدوية والصيام والترطيب",
        body: [
          "تمرّ حماية الكلى عبر المتابعة الطبية بقدر ما تمرّ عبر عادات الحياة اليومية. ففي المغرب، ينتشر التطبيب الذاتي: مضادات الالتهاب تُؤخذ لتسكين الآلام، ومضادات حيوية دون وصفة، إضافة إلى الأعشاب والعلاجات التقليدية التي يُعتقد أنها «تُنظّف الكلى». غير أن عدداً من هذه المنتجات قد يكون على العكس سامّاً للكلى، خاصة لدى المصابين بالسكري أو ارتفاع الضغط أو المسنّين أو من يعانون أصلاً مرضاً كلوياً. وقاعدة الحيطة بسيطة: لا تتناول أي دواء أو علاج على المدى الطويل دون استشارة الطبيب، وقدّم لطبيب الكلى القائمة الكاملة لما تستهلكه، بوصفة أو بدونها.",
          "كما يطرح المناخ الحار في جزء كبير من البلاد وصيام رمضان مسألة الترطيب. فالجفاف المتكرّر يُجهد الكلى ويُشجّع على تكوّن الحصى. وبالنسبة لعموم الناس، يبقى شرب ما يكفي من الماء على مدار اليوم عادةً جيدة، دون إفراط لا لزوم له. أما مرضى الكلى فلا ينبغي أن يقرّروا بمفردهم كمية السوائل: فحسب مرحلة المرض والعلاج، قد يوصي طبيب الكلى على العكس بالحدّ من الكمية. وينبغي التحقق من أي قرار بالصيام معه مسبقاً؛ وعند الشعور بالوعكة أو الحمى الشديدة أو علامات الجفاف الحاد، يجب استشارة الطبيب دون تأخير، وفي حالات الطوارئ الحيوية الاتصال بالرقم 15 (المساعدة الطبية المستعجلة).",
        ],
      },
    ],
    prix: {
      title: "الأسعار والتعريفات في طب الكلى بالمغرب",
      intro: "في القطاع الخاص، الأتعاب حرة وتختلف حسب المدينة والطبيب وتعقيد الملف. إليك فئات تعريفية إرشادية لسنة 2026. ويطبّق القطاع العام تعريفات أقل.",
      rows: [
        { label: "استشارة طب الكلى (المدن الكبرى)", value: "300 – 500 درهم" },
        { label: "استشارة طب الكلى (المدن الأخرى)", value: "250 – 400 درهم" },
        { label: "تصوير الكلى بالصدى", value: "300 – 600 درهم" },
        { label: "تحليل دم كلوي (الكرياتينين، DFG، شوارد الدم)", value: "150 – 400 درهم" },
        { label: "حصة تصفية الدم (مركز متعاقد)", value: "تكفل CNSS / AMO" },
      ],
      note: "تعريفات إرشادية لسنة 2026، دون احتساب الفحوصات الإضافية. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي وفق التعريفة الوطنية المرجعية (TNR).",
    },
  },

  "kinesitherapie": {
    reviewed: "2026-07-05",
    description:
      "العلاج الطبيعي، المعروف أيضاً بالترويض الطبي، مهنة شبه طبية تحتل مكانة أساسية في مسار العلاج بالمغرب. أخصائي العلاج الطبيعي ليس طبيباً: فهو يتدخل بناءً على وصفة من طبيب عام أو أخصائي لإعادة تأهيل الجسم بعد إصابة أو عملية جراحية أو مرض. مجال عمله واسع: إعادة التأهيل بعد كسر أو التواء أو تركيب مفصل اصطناعي، علاج آلام الظهر والمفاصل، إعادة التأهيل التنفسي والعصبي (بعد سكتة دماغية مثلاً)، والتكفل بالرياضيين. يعتمد العلاج على حصص متعددة، غالباً عدة حصص في الأسبوع على مدى أسابيع، تجمع بين التمارين والتحريكات اليدوية والتدليك والأجهزة. بالمغرب، نجد أخصائيي العلاج الطبيعي في العيادات الخاصة والمصحات والمستشفيات العمومية. يستفيد المؤمنون لدى CNSS أو AMO من استرجاع جزئي للحصص عندما تكون موصوفة. عبر SantéauMaroc، يمكنكم إيجاد أخصائي علاج طبيعي قريب منكم وحجز موعد عبر الإنترنت مجاناً.",
    quandConsulter: [
      "بعد كسر أو التواء أو عملية جراحية، لاستعادة الحركة والقوة",
      "في حالة آلام الظهر أو الرقبة أو عرق النسا المستمرة",
      "لإعادة التأهيل بعد سكتة دماغية أو إصابة عصبية",
      "في حالة ضيق تنفسي مزمن يتطلب تصفية القصبات (العلاج الطبيعي التنفسي)",
      "بعد إصابة رياضية أو للوقاية من انتكاساتها لدى الرياضيين",
    ],
    faqs: [
      { q: "كم تكلف حصة العلاج الطبيعي بالمغرب؟", a: "في القطاع الخاص، الأتعاب حرة. تتراوح تكلفة الحصة عموماً بين 120 و300 درهم حسب المدينة والعيادة ونوع إعادة التأهيل. وبما أن العلاج يتطلب عدة حصص، من المفيد الاستفسار عن التكلفة الإجمالية منذ الزيارة الأولى." },
      { q: "هل تلزم وصفة طبية لزيارة أخصائي العلاج الطبيعي؟", a: "نعم، بالمغرب يتدخل أخصائي العلاج الطبيعي بناءً على وصفة طبية. يحرر الطبيب العام أو الأخصائي وصفة تحدد عدد الحصص ونوعها. هذه الوصفة ضرورية أيضاً للحصول على استرجاع من CNSS أو AMO." },
      { q: "هل حصص العلاج الطبيعي قابلة للاسترجاع؟", a: "يستفيد المؤمنون لدى CNSS أو AMO من استرجاع جزئي للحصص عندما تكون موصوفة من طرف طبيب. يتم الاسترجاع على أساس التعريفة المرجعية (TNR)؛ ويعتمد الباقي على عاتق المريض على التغطية وعلى الأتعاب الفعلية للعيادة." },
      { q: "كم عدد حصص العلاج الطبيعي اللازمة؟", a: "يعتمد ذلك على الحالة المرضية. قد يتطلب التواء بسيط بضع حصص، بينما تتطلب إعادة التأهيل بعد مفصل اصطناعي أو سكتة دماغية غالباً عشرات الحصص. يقيّم الأخصائي التقدم بانتظام ويعدّل عدد الحصص مع الطبيب الواصف." },
      { q: "ما الفرق بين أخصائي العلاج الطبيعي وأخصائي تقويم العظام (الأوستيوباثي)؟", a: "أخصائي العلاج الطبيعي مهني شبه طبي يقوم بإعادة التأهيل بناءً على وصفة طبية، مع حصص غالباً قابلة للاسترجاع. أما الأوستيوباثي فيمارس تحريكات يدوية ولا يشترط وصفة. قد يكمّل الاثنان بعضهما، لكن متابعة العلاج الطبيعي وحدها تدخل في إطار استرجاع CNSS/AMO." },
      { q: "كيف أحجز موعداً مع أخصائي علاج طبيعي بالمغرب؟", a: "عبر SantéauMaroc، صفّي حسب تخصص «العلاج الطبيعي» وحسب المدينة لإيجاد ممارس قريب منكم، ثم احجزوا عبر الإنترنت مجاناً. تذكروا إحضار وصفتكم الطبية وفحوصاتكم المحتملة (صور شعاعية، IRM) في الحصة الأولى." },
      { q: "هل يمكن لأخصائي العلاج الطبيعي أن يأتي لإجراء الحصص في المنزل؟", a: "نعم، يقترح العديد من أخصائيي العلاج الطبيعي حصصاً في المنزل، وهو حل مفيد للأشخاص المسنين والمرضى غير القادرين على الحركة بعد جراحة أو الذين يتعذر عليهم التنقل. عادة ما يكون السعر أعلى منه في العيادة، غالباً بين 200 و400 درهم، بسبب التنقل. اذكر هذه الحاجة عند حجز الموعد، لأن الحصص المنزلية لا يوفرها جميع الممارسين." },
      { q: "كم تدوم حصة العلاج الطبيعي؟", a: "تدوم الحصة في الغالب بين 20 و45 دقيقة، حسب الحالة المرضية والتقنيات المستعملة. تكون الحصة الأولى عادة أطول لأنها تشمل تقييماً كاملاً للألم والحركة والقوة. يكيّف أخصائي العلاج الطبيعي بعد ذلك المدة حسب تعب المريض والتقدم الملاحظ." },
      { q: "هل يمكن لأخصائي العلاج الطبيعي أن يضع تشخيصاً طبياً؟", a: "لا، أخصائي العلاج الطبيعي ليس طبيباً ولا يضع تشخيصاً طبياً ولا يصف فحوصات أو أدوية. يقوم بتقييم وظيفي (الحركة، القوة، الألم) لتوجيه إعادة التأهيل، لكن في إطار الوصفة التي يحررها الطبيب. وإذا ظهرت علامات غير معتادة، يعيد توجيهك إلى طبيبك المعالج أو الأخصائي الذي حرّر الوصفة." },
    ],
    essentiel: [
      { value: "120 – 300 درهم", label: "تكلفة الحصة" },
      { value: "بوصفة طبية", label: "مهنة شبه طبية، تتدخل بناءً على وصفة" },
      { value: "CNSS · AMO", label: "استرجاع جزئي إذا كان موصوفاً" },
    ],
    sections: [
      {
        h: "أهم دواعي إعادة التأهيل",
        body: [
          "يتكفل أخصائي العلاج الطبيعي بمجموعة واسعة جداً من الحالات. أكثرها شيوعاً بالمغرب هي عقابيل الإصابات (الكسور، الالتواءات، الخلوع)، وآلام العمود الفقري (آلام أسفل الظهر، آلام الرقبة، عرق النسا)، وإعادة التأهيل بعد جراحة العظام مثل تركيب مفصل اصطناعي للورك أو الركبة.",
          "كما يتدخل في إعادة التأهيل العصبي، خاصة بعد سكتة دماغية، لمساعدة المريض على استعادة الحركة والاستقلالية. ويكمّل العلاج الطبيعي التنفسي، المفيد للرضيع المصاب بالتهاب القصيبات كما للبالغ المحتقن، والتكفل بالرياضيين هذا المجال المتعدد الاستعمالات.",
        ],
      },
      {
        h: "سير الحصة العلاجية",
        body: [
          "تبدأ الحصة بتقييم يقدّر الألم والحركة والقوة. انطلاقاً من هذا التقييم والوصفة الطبية، يضع أخصائي العلاج الطبيعي خطة علاج مخصصة تتطور مع تقدم المريض.",
          "تجمع التقنيات المستعملة بين التمارين النشطة والتمطيطات، والتحريكات والمعالجات اليدوية، والتدليك، وأحياناً الأجهزة (العلاج الكهربائي، الأمواج فوق الصوتية، الحرارة، البرودة). تتطلب إعادة التأهيل مشاركة نشطة من المريض، بما في ذلك تمارين يواصلها في المنزل بين الحصص.",
        ],
      },
      {
        h: "الوقاية وتوعية المريض",
        body: [
          "إلى جانب العلاج، يلعب أخصائي العلاج الطبيعي دوراً وقائياً. فهو يعلّم المريض الحركات السليمة اليومية، ويصحح وضعيات العمل، وينصح بشأن ترتيب مكان العمل أو حمل الأثقال لتفادي انتكاسات آلام الظهر.",
          "لدى الرياضيين، يقترح برامج تقوية وإحماء للوقاية من الإصابات. هذا البُعد التوعوي أساسي: فهو يمكّن المريض من أن يصبح فاعلاً في تعافيه والحفاظ على نتائجه بشكل دائم.",
        ],
      },
      {
        h: "الاسترجاع ومسار العلاج",
        body: [
          "بالمغرب، يندرج العلاج الطبيعي ضمن مسار علاج موصوف. يحرر الطبيب المعالج أو الأخصائي وصفة تفصّل عدد الحصص ونوعها، وهي وثيقة ضرورية للاستفادة من التكفل.",
          "يستفيد المؤمنون لدى CNSS أو AMO من استرجاع جزئي للحصص الموصوفة، محسوب على أساس التعريفة الوطنية المرجعية (TNR). في القطاع العمومي وبعض المصحات المتعاقدة، قد تكون التكلفة أقل؛ ويُنصح بالاحتفاظ بالفواتير وأوراق العلاج من أجل الاسترجاع.",
        ],
      },
      {
        h: "حالات خاصة: الأطفال، المسنون والرياضيون",
        body: [
          "يتكيف العلاج الطبيعي مع كل مرحلة من مراحل الحياة. لدى الرضيع والطفل، يعالج خاصة التهابات القصيبات واضطرابات العظام والتأخر الحركي، بتقنيات لطيفة وترفيهية ملائمة.",
          "لدى المسنّ، يهدف إلى الحفاظ على الاستقلالية والوقاية من السقوط وإعادة التأهيل بعد كسر أو مفصل اصطناعي. ولدى الرياضي، يسرّع العودة إلى الميدان ويحدّ من الانتكاسات. في جميع الحالات، يضمن التنسيق مع الطبيب الواصف تكفلاً متناسقاً.",
        ],
      },
      {
        h: "كيف تتعرّف على أخصائي علاج طبيعي مؤهل في المغرب",
        body: [
          "العلاج الطبيعي مهنة شبه طبية منظَّمة في المغرب. لممارسة المهنة، يجب أن يكون الممارس حاصلاً على دبلوم معترف به (يُمنح من المعاهد العمومية مثل ISPITS أو من مؤسسات خاصة معتمدة) وأن يتوفر على ترخيص بالمزاولة. يعرض الممارس الجاد دبلومه، ويشتغل في عيادة يمكن التعرف عليها، ويعمل دائماً على أساس وصفة طبية، وهو ضمان لإطار علاجي مطابق للقانون.",
          "من المشروع الاستفسار عن تكوين الممارس وخبرته، خاصة بالنسبة لإعادة تأهيل متخصصة (عصبية أو تنفسية أو خاصة بالأطفال أو الرياضيين). على منصة SantéauMaroc، يوضح كل ملف المدينة واللغات المتحدث بها وطرق التكفل، مما يساعدك على اختيار أخصائي علاج طبيعي مناسب لحالتك. وعند وجود أي شك بخصوص تقنية مقترحة، لا تتردد في مناقشتها مع الطبيب الذي حرّر الوصفة.",
        ],
      },
    ],
    prix: {
      title: "أسعار العلاج الطبيعي بالمغرب",
      intro: "في القطاع الخاص، أتعاب أخصائيي العلاج الطبيعي حرة وتختلف حسب المدينة والعيادة ونوع إعادة التأهيل. إليكم فئات سعرية إرشادية لتقريب الصورة.",
      rows: [
        { label: "حصة في العيادة (المدن الكبرى)", value: "150 – 300 درهم" },
        { label: "حصة في العيادة (المدن الأخرى)", value: "120 – 250 درهم" },
        { label: "التقييم الأولي / الفحص الأول", value: "150 – 350 درهم" },
        { label: "حصة علاج طبيعي تنفسي (رضيع)", value: "150 – 300 درهم" },
        { label: "حصة في المنزل", value: "200 – 400 درهم" },
      ],
      note: "فئات إرشادية لسنة 2026، للإعلام فقط وغير تعاقدية. يستفيد المؤمنون لدى CNSS أو AMO من استرجاع جزئي للحصص الموصوفة، على أساس التعريفة المرجعية (TNR).",
    },
  },

  "sage-femme": {
    reviewed: "2026-07-05",
    description:
      "القابلة هي مهنية صحية متخصصة في متابعة الحمل الطبيعي والولادة وفترة ما بعد الولادة. في المغرب، تمارس القابلة عملها في القطاع العام (دور الولادة، المراكز الصحية، مستشفيات الولادة) وكذلك في القطاع الحر، في عيادة خاصة أو في مصحة. تتولى مراقبة حالات الحمل التي لا تنطوي على خطر خاص، والتحضير للولادة، والولادة الطبيعية، إضافة إلى متابعة الأم والمولود الجديد بعد الولادة. كما يشمل مجال عملها وسائل منع الحمل، وفحص المسحة، والتربية على الصحة الجنسية والإنجابية. وبمجرد ظهور أي عامل خطر، توجه القابلة المريضة إلى طبيب أمراض النساء والتوليد. تلعب هذه المهنة دورا محوريا في الحد من وفيات الأمهات والمواليد بالمغرب، خصوصا من خلال البرامج الوطنية لصحة الأم. عبر SantéauMaroc، يمكنكم تحديد قابلة قريبة منكم وتنظيم متابعة حمل مطمئنة وقريبة.",
    quandConsulter: [
      "منذ بداية الحمل لبدء متابعة منتظمة وإجراء الفحوصات الموصى بها",
      "للتحضير للولادة (دروس التحضير للولادة والأبوة)",
      "بعد الولادة، لمتابعة ما بعد الولادة للأم والمولود الجديد",
      "من أجل استشارة حول وسائل منع الحمل أو اختيار طريقة مناسبة",
      "لإجراء فحص المسحة أو الحصول على نصيحة في الصحة الجنسية والإنجابية",
    ],
    faqs: [
      { q: "ما الفرق بين القابلة وطبيب أمراض النساء؟", a: "تتابع القابلة حالات الحمل الطبيعية، أي التي لا تنطوي على خطر خاص، وتجري الولادات العادية. أما طبيب أمراض النساء والتوليد فيتكفل بحالات الحمل ذات الخطورة والأمراض والتدخلات مثل الولادة القيصرية. توجه القابلة المريضة إلى الطبيب بمجرد اكتشاف أي عامل خطر." },
      { q: "كم تكلف استشارة القابلة في المغرب؟", a: "في القطاع الحر، الأتعاب حرة. تتراوح الاستشارة عادة بين 200 و400 درهم في المدن الكبرى، وبين 150 و300 درهم في المدن الأخرى. في القطاع العام والمراكز الصحية، تكون متابعة الحمل قليلة التكلفة جدا، بل مجانية أحيانا حسب المؤسسات." },
      { q: "هل يمكن للقابلة أن تجري الولادة؟", a: "نعم، القابلة مؤهلة لإجراء الولادات الطبيعية. تراقب مرحلة المخاض، وتجري الولادة، وتقدم الرعاية الأولى للمولود الجديد. وفي حال حدوث مضاعفات، تستدعي طبيب أمراض النساء والتوليد لتكفل طبي أو جراحي." },
      { q: "هل يتم استرجاع مصاريف المتابعة لدى القابلة في المغرب؟", a: "يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لأعمال متابعة الحمل والولادة، وفق التسعيرة الوطنية المرجعية (TNR). يختلف المبلغ المسترجَع حسب المؤسسة وطبيعة العمل الطبي. يُنصح بالاحتفاظ بأوراق العلاج والوثائق المثبتة." },
      { q: "في أي مرحلة من الحمل ينبغي استشارة القابلة؟", a: "يُنصح بالاستشارة منذ تأكد الحمل، ويُفضل خلال الثلث الأول. تستمر المتابعة بعد ذلك بوتيرة منتظمة حتى الولادة، ثم تمتد باستشارة ما بعد الولادة للأم والمولود الجديد." },
      { q: "كيف يمكن أخذ موعد مع قابلة في المغرب؟", a: "عبر SantéauMaroc، صفِّ حسب التخصص «قابلة» وحسب المدينة للعثور على مهنية قريبة منكم. يمكنكم الاطلاع على ملفها ولغاتها وشروطها، ثم حجز موعدكم عبر الإنترنت مجانا في بضع نقرات." },
      { q: "هل يمكن للقابلة أن تصف الأدوية أو الفحوصات في المغرب؟", a: "نعم، في إطار اختصاصاتها، يمكن للقابلة أن تصف بعض فحوصات متابعة الحمل (الفحوصات بالصدى، التحاليل الدموية، الفحوصات المصلية) وكذلك العلاجات المرتبطة بفيزيولوجيا الحمل ومنع الحمل. غير أن مجال وصفها يبقى أضيق من مجال الطبيب. وفي حالة وجود مرض أو حمل عالي الخطورة، توجّه المريضة إلى طبيب النساء والتوليد." },
      { q: "هل يمكن متابعة حمل عالي الخطورة من طرف القابلة وحدها؟", a: "لا. تتكفل القابلة بمتابعة حالات الحمل الفيزيولوجية، أي دون مضاعفات. وبمجرد تحديد وجود خطر (ارتفاع ضغط الدم، سكري الحمل، الحمل المتعدد، سوابق مرضية ثقيلة)، تصبح المتابعة المشتركة أو التكفل من طرف طبيب النساء والتوليد ضرورية. وهذا العمل الشبكي شائع في المغرب ويهدف إلى ضمان سلامتك وسلامة الجنين." },
      { q: "هل تتنقل القابلة إلى المنزل في المغرب؟", a: "تقترح بعض القابلات في القطاع الخاص زيارات منزلية، خاصة لمتابعة ما بعد الولادة، وإعادة تأهيل العجان (العضلات الحوضية)، ومرافقة الرضاعة الطبيعية. تتوقف هذه الخدمة على توفر القابلة وعلى مدينتك. أثمنة الزيارات المنزلية حرة وغالبا ما تكون أعلى من الكشف بالعيادة؛ ويُنصح بتأكيدها عند حجز الموعد." },
    ],
    essentiel: [
      { value: "200 – 400 درهم", label: "تكلفة الاستشارة" },
      { value: "الحمل الطبيعي", label: "مجال العمل الأساسي" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "متابعة الحمل والتحضير للولادة",
        body: [
          "يكمن جوهر مهنة القابلة في متابعة حالات الحمل التي لا تنطوي على خطر خاص. في كل استشارة، تراقب سير الحمل: قياس الضغط، الوزن، ارتفاع الرحم، الاستماع إلى نبضات قلب الجنين، ووصف الفحوصات الموصى بها. كما تُطلع الأم المستقبلية على نمط العيش الصحي والتغذية والعلامات التي يجب أن تنبهها خلال الحمل.",
          "يحتل التحضير للولادة والأبوة مكانة مهمة. من خلال حصص فردية أو جماعية، تساعد القابلة المرأة على مقاربة الولادة بمزيد من الطمأنينة: التنفس، وتدبير الألم، والوضعيات، والرضاعة، واستقبال المولود الجديد. هذه المواكبة القريبة ثمينة بشكل خاص للحمل الأول.",
        ],
      },
      {
        h: "الولادة والتكفل بالمولود الجديد",
        body: [
          "القابلة مؤهلة لإجراء الولادات الطبيعية. تراقب المخاض، وترافق المرأة أثناء الانقباضات، وتجري الولادة الطبيعية، وتقدم الرعاية الأولى للمولود الجديد، بما في ذلك الفحص الأولي والإرضاع المبكر. في المغرب، تتدخل القابلة في دور الولادة والمراكز الصحية ومستشفيات الولادة العمومية والمصحات الخاصة.",
          "في حال حدوث مضاعفات (معاناة جنينية، نزيف، وضعية غير طبيعية، تعثر تقدم الولادة)، تستدعي دون تأخير طبيب أمراض النساء والتوليد لتكفل طبي أو ولادة قيصرية. هذا التعاون بين القابلة والطبيب أساسي لسلامة الأم والطفل، ويشكل ركيزة في الحد من وفيات الأمهات والمواليد.",
        ],
      },
      {
        h: "متابعة ما بعد الولادة للأم والطفل",
        body: [
          "بعد الولادة، تتولى القابلة متابعة الأم: مراقبة التئام الجروح، والتأكد من عودة الرحم إلى وضعه الطبيعي، والكشف عن أي عدوى محتملة أو تراجع في المعنويات (اكتئاب ما بعد الولادة). كما تواكب إرساء الرضاعة الطبيعية وتجيب عن الأسئلة الكثيرة في الأيام الأولى.",
          "يستفيد المولود الجديد بدوره من مراقبة: الوزن، التغذية، اليرقان، التئام السرة، وحسن النمو. تتيح استشارة ما بعد الولادة، بعد بضعة أسابيع من الولادة، تقييم صحة الأم واستئناف وسيلة لمنع الحمل وتقدير الحاجة إلى إعادة تأهيل العجان.",
        ],
      },
      {
        h: "منع الحمل والمسحة وصحة المرأة",
        body: [
          "خارج فترة الحمل، تلعب القابلة دورا في الصحة الجنسية والإنجابية. تجري استشارات حول وسائل منع الحمل، وتساعد على اختيار الطريقة الأنسب (حبوب، لولب، شريحة، واقٍ)، وتضمن متابعة وسيلة منع الحمل عبر الزمن. تساهم هذه المواكبة في تباعد أفضل بين الولادات.",
          "كما تجري القابلة مسحة عنق الرحم، وهو فحص بسيط وسريع للكشف عن سرطان عنق الرحم، وتوعِّي النساء بأهمية المتابعة المنتظمة. وعند اكتشاف خلل أو عند تجاوز مشكل نسائي لمجال عملها، توجه المريضة إلى طبيب أمراض النساء.",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع في المغرب",
        body: [
          "في المغرب، تندرج المتابعة لدى القابلة ضمن مسار صحة الأم. في القطاع العام، تكون متابعة الحمل والولادة في المؤسسات الصحية سهلة الولوج جدا، وغالبا مجانية أو بتكلفة منخفضة، مما يعزز الصحة القريبة، بما في ذلك في الوسط القروي. أما في القطاع الحر، فالأتعاب حرة وتختلف حسب المدينة وطبيعة الأعمال الطبية.",
          "يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للاستشارات ومتابعة الحمل والولادة، وفق التسعيرة الوطنية المرجعية (TNR). يُنصح بالتحقق من الشروط لدى الصندوق والاحتفاظ بجميع الوثائق المثبتة لتسهيل عملية الاسترجاع.",
        ],
      },
      {
        h: "إعادة تأهيل العجان ومرافقة الرضاعة الطبيعية",
        body: [
          "بعد الولادة، تلعب القابلة دورا محوريا في تعافي جسم الأم. إعادة تأهيل العجان، التي تهدف إلى إعادة شدّ عضلات قاع الحوض، تساعد على الوقاية من التسرب البولي وهبوط الأعضاء؛ وتُستهل عموما بعد أسابيع قليلة من الولادة، بمجرد إنجاز الفحص الشامل لما بعد الولادة. كما يمكن للقابلة أن تقترح تمارين لطيفة لإعادة تأهيل عضلات البطن، مكيّفة مع حالتك وطريقة ولادتك.",
          "تُعد مرافقة الرضاعة الطبيعية جانبا أساسيا آخر من تدخلها. تساعد القابلة على تصحيح وضعية الرضيع على الثدي، وتخفيف التشققات واحتقان الثدي، وطمأنة الأمهات الجدد أمام شكوك الأيام الأولى. وفي حالة اختيار الرضاعة بالقنينة أو الاضطرار إليها، تقدم لك أيضا نصائح حول الممارسات السليمة. تُقدَّم هذه الخدمات بالعيادة، وحسب القابلة بالمنزل أيضا؛ وفي حالة ارتفاع الحرارة، أو ألم شديد بالثدي، أو أي علامة مقلقة لدى الرضيع، اتصلي بسرعة بطبيب أو بالرقم 15 (المساعدة الطبية المستعجلة).",
        ],
      },
    ],
    prix: {
      title: "أسعار القابلة في المغرب",
      intro: "في القطاع الحر، أتعاب القابلات حرة وتختلف حسب المدينة والخبرة ونوع التكفل. فيما يلي فئات إرشادية ملاحَظة سنة 2026.",
      rows: [
        { label: "الاستشارة (المدن الكبرى)", value: "200 – 400 درهم" },
        { label: "الاستشارة (المدن الأخرى)", value: "150 – 300 درهم" },
        { label: "حصة التحضير للولادة", value: "150 – 350 درهم" },
        { label: "استشارة ما بعد الولادة", value: "200 – 400 درهم" },
        { label: "المسحة / استشارة منع الحمل", value: "200 – 400 درهم" },
      ],
      note: "فئات إرشادية لسنة 2026، على سبيل الإخبار. المتابعة في القطاع العام سهلة الولوج جدا، وغالبا مجانية أو بتكلفة منخفضة. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي وفق التسعيرة الوطنية المرجعية (TNR).",
    },
  },

  "psychologie": {
    reviewed: "2026-07-05",
    description:
      "الأخصائي النفسي هو مختص في الصحة النفسية يواكب الأشخاص ويصغي إليهم ويساعدهم على تجاوز الصعوبات النفسية عبر الكلام وتقنيات ملائمة، مثل العلاجات المعرفية السلوكية (TCC). في المغرب، يتدخل في حالات القلق والاكتئاب والتوتر والحداد واضطرابات النوم والصعوبات العلائقية أو مشاكل الطفل والزوجين. خلافًا للطبيب النفسي الذي هو طبيب يصف الأدوية، لا يسلّم الأخصائي النفسي أي وصفة طبية: يقوم عمله على المواكبة العلاجية والدعم العاطفي، في إطار سري تام. يُستشار في القطاع الخاص بالعيادة، وكذلك في بعض المؤسسات العمومية والجمعيات والمراكز المدرسية أو الجامعية. الطلب على المتابعة النفسية يتزايد في المغرب، مدفوعًا بوعي متنامٍ وبرفع تدريجي للوصم عن العلاجات النفسية. عبر SantéauMaroc، يمكنك العثور على أخصائي نفسي قريب منك، ومقارنة الملفات، وحجز موعد عبر الإنترنت مجانًا.",
    quandConsulter: [
      "قلق مستمر أو نوبات هلع أو توتر يغزو الحياة اليومية",
      "حزن دائم أو فقدان الرغبة أو علامات موحية بالاكتئاب",
      "حداد أو انفصال أو صدمة أو حدث صعب يصعب تجاوزه",
      "صعوبات لدى الطفل: الدراسة أو السلوك أو النوم أو المشاعر",
      "توترات زوجية أو نزاعات عائلية أو صعوبات علائقية متكررة",
    ],
    faqs: [
      { q: "ما الفرق بين الأخصائي النفسي والطبيب النفسي في المغرب؟", a: "الطبيب النفسي طبيب: يشخّص ويصف الأدوية ويتكفل بالاضطرابات النفسية الحادة. أما الأخصائي النفسي فليس طبيبًا ولا يصف الأدوية؛ بل يقدم مواكبة عبر الكلام وعلاجات مثل TCC. ويمكن أن يتكامل الاثنان لمتابعة شاملة." },
      { q: "كم تكلف استشارة لدى أخصائي نفسي في المغرب؟", a: "الأتعاب حرة في القطاع الخاص. احسب عمومًا بين 300 و500 درهم للجلسة في الدار البيضاء أو الرباط أو مراكش، وغالبًا بين 250 و400 درهم في المدن الأخرى. يتغير السعر حسب خبرة المختص ومدة الجلسة ونوع العلاج." },
      { q: "هل جلسات الأخصائي النفسي مسترجعة في المغرب؟", a: "يبقى التكفل بجلسات الأخصائي النفسي محدودًا. قد تسترجع بعض التأمينات التكميلية الخاصة جزءًا من الجلسات حسب العقد. أما استرجاعات CNSS أو AMO فتخص أساسًا الأعمال الطبية؛ تحقق دائمًا من شروط تغطيتك قبل بدء المتابعة." },
      { q: "كيف تجري الجلسة الأولى لدى الأخصائي النفسي؟", a: "الجلسة الأولى مقابلة تقييمية: يصغي إليك الأخصائي النفسي، ويحدد طلبك وصعوباتك، ثم يقترح إطار عمل. وهي أيضًا فرصة لطرح أسئلتك. كل ما يُتبادَل يبقى سريًا تامًا." },
      { q: "هل يمكن للأخصائي النفسي استقبال الأطفال والأزواج؟", a: "نعم. يتخصص العديد من الأخصائيين النفسيين في مواكبة الطفل والمراهق، أو في علاج الزوجين والأسرة. عندئذ تُكيَّف المتابعة: ألعاب ووسائط للطفل، وجلسات مشتركة للزوجين. حدد حاجتك عند حجز الموعد." },
      { q: "كيف تحجز موعدًا مع أخصائي نفسي في المغرب؟", a: "عبر SantéauMaroc، صفِّ حسب تخصص «علم النفس» وحسب مدينتك لعرض الأخصائيين النفسيين المتاحين قربك. اطّلع على ملفهم ومجالات خبرتهم ولغاتهم، ثم احجز موعدك عبر الإنترنت مجانًا في التوقيت الذي يناسبك." },
      { q: "هل يمكن استشارة أخصائي نفسي عن بُعد (استشارة عن بعد) في المغرب؟", a: "نعم، يقترح العديد من الأخصائيين النفسيين في المغرب جلسات عبر الفيديو، وهو خيار عملي للأشخاص البعيدين عن المدن الكبرى، وللمغاربة المقيمين بالخارج، ولذوي الحركة المحدودة. تُناسب الاستشارة عن بُعد المتابعة النفسية العلاجية ومرافقة التوتر أو القلق. غير أنها تبقى غير مستحسنة في حالات الأزمة الحادة أو خطر الانتحار، حيث يجب الاتصال بالنجدة الطبية (15) أو التوجه إلى المستعجلات." },
      { q: "ما وتيرة زيارة الأخصائي النفسي وكم تدوم المتابعة؟", a: "الوتيرة الأكثر شيوعاً هي جلسة كل أسبوع أو كل أسبوعين، وتدوم كل جلسة عموماً من 45 دقيقة إلى ساعة. تختلف المدة الإجمالية للمتابعة حسب السبب: بضع جلسات لمرافقة ظرفية، وعدة أشهر لعمل نفسي علاجي معمّق. يُكيّف الأخصائي النفسي هذا الإطار معك، ولا يوجد أي التزام إجباري بمدة محددة." },
      { q: "كيف نتأكد من أن الأخصائي النفسي مؤهَّل فعلاً في المغرب؟", a: "تأكد من أن الممارس يحمل شهادة جامعية في علم النفس (إجازة ثم ماستر أو ما يعادله) وفضّل تكويناً معترفاً به. يمكنك أن تسأله مباشرة عن مساره وتخصصه (السريري، الطفل، الزوجين…) ومقاربته العلاجية. على SantéauMaroc، توضّح بطاقة الأخصائي النفسي تكوينه ومجالات تكفّله لمساعدتك على الاختيار بثقة." },
    ],
    essentiel: [
      { value: "300 – 500 درهم", label: "ثمن الجلسة" },
      { value: "دون وصفة", label: "لا يصف الأدوية" },
      { value: "حسب العقد", label: "تكفل التأمين الخاص" },
    ],
    sections: [
      {
        h: "أكثر أسباب الاستشارة شيوعًا",
        body: [
          "يواكب الأخصائي النفسي طيفًا واسعًا من الصعوبات: القلق ونوبات الهلع والتوتر المزمن والإنهاك واضطرابات النوم، وكذلك الحالات الاكتئابية وفقدان الثقة أو الضيق النفسي المبهم. كما يتدخل بعد صدمة أو حداد أو انفصال، لمساعدة الشخص على استعادة توازنه.",
          "في المغرب، غالبًا ما تُكتَم المعاناة النفسية حياءً أو خوفًا من الحكم. استشارة الأخصائي النفسي ليست حكرًا على الحالات الخطيرة: بل هي خطوة مفيدة بمجرد أن تصبح الحياة اليومية مرهقة. وغالبًا ما تسهّل المواكبة المبكرة التعافي وتجنّب تفاقم الأعراض.",
        ],
      },
      {
        h: "المقاربات والعلاجات المقترحة",
        body: [
          "يعتمد الأخصائي النفسي على مناهج معترف بها. تساعد العلاجات المعرفية السلوكية (TCC) على تحديد وتعديل الأفكار والسلوكات المسببة للمعاناة؛ وهي فعالة في القلق والرهاب والاكتئاب. وتوجد مقاربات أخرى: الدعم النفسي والعلاجات الإنسانية وعلاج الزوجين أو الأسرة والتكفل بالطفل عبر اللعب.",
          "يتوقف اختيار المقاربة على الطلب والشخصية وأهداف كل فرد. يتغير عدد الجلسات: بضعة مواعيد لصعوبة عابرة، ومتابعة أطول لعمل عميق. يُحدَّد الإيقاع مع المختص، غالبًا جلسة أسبوعيًا أو كل خمسة عشر يومًا.",
        ],
      },
      {
        h: "أخصائي نفسي، طبيب نفسي، معالج نفسي: كيف تختار",
        body: [
          "التمييز أساسي. الأخصائي النفسي حاصل على شهادة جامعية في علم النفس؛ وهو ليس طبيبًا ولا يصف الأدوية. أما الطبيب النفسي فهو طبيب مختص يمكنه وضع تشخيص ووصف علاج، لا سيما للاضطرابات الحادة. أما لقب المعالج النفسي فيدل على ممارسة العلاج النفسي، يزاولها بعض الأخصائيين النفسيين أو الأطباء.",
          "في حال اضطرابات مهمة تستلزم علاجًا، يعمل الأخصائي النفسي والطبيب النفسي معًا عن طيب خاطر. إذا ترددت، يتيح موعد أول توجيهك نحو المختص المناسب. الأهم هو الشعور بالثقة مع المختص المختار.",
        ],
      },
      {
        h: "السرية وإطار التكفل",
        body: [
          "كل ما يُقال في الجلسة مشمول بالسر المهني: الأخصائي النفسي ملزم بسرية صارمة، وهذا هو أساس علاقة الثقة. لا يُشارَك أي شيء دون موافقتك، إلا في حالات استثنائية ينص عليها القانون، مثل خطر جسيم عليك أو على الغير.",
          "يمكن أن تتم المتابعة بالعيادة، وكذلك عن بُعد عبر الاستشارة المرئية، وهي ممارسة تطورت في المغرب وتسهّل الولوج إلى العلاج، خصوصًا في المدن الأقل تجهيزًا. يُحدَّد الإطار ومدة الجلسات والكيفيات منذ البداية لمواكبة واضحة ومطمئنة.",
        ],
      },
      {
        h: "الكلفة والتكفل والولوج إلى العلاج",
        body: [
          "في القطاع الخاص، الأتعاب حرة وتتغير حسب المدينة والخبرة ومدة الجلسات. خلافًا للاستشارات الطبية، لا تحظى جلسات الأخصائي النفسي باسترجاع منهجي من CNSS أو AMO؛ وقد تغطي بعض التأمينات التكميلية الخاصة جزءًا منها حسب العقد المبرم.",
          "توجد بدائل لولوج أيسر: مراكز الصحة النفسية العمومية وخلايا الإصغاء الجامعية والجمعيات وخطوط المساعدة. في حال ضيق نفسي حاد أو خطر فوري، لا ينبغي التردد في الاتصال بالمستعجلات (SAMU 15) أو التوجه إلى أقرب مصلحة استعجالية.",
        ],
      },
      {
        h: "وضع الأخصائي النفسي في المغرب: اللقب والإطار والحدود",
        body: [
          "في المغرب، يستند لقب الأخصائي النفسي إلى تكوين جامعي في علم النفس (إجازة ثم ماستر)، وهو تكوين مختلف عن تكوين الطبيب النفسي الذي هو طبيب. يرافق الأخصائي النفسي ويُقيّم ويُجري العلاجات النفسية، لكنه لا يضع تشخيصاً طبياً ولا يحق له وصف الأدوية. هذا التمييز أساسي لتوجيه طلبك نحو المهني المناسب.",
          "لا يزال تنظيم المهنة في طور البناء في المغرب، حيث تعمل جمعيات مهنية على الاعتراف بالمهنة وتأطيرها. عملياً، يُنصح إذن بالتحقق من تكوين الممارس والانتباه إلى مجال تدخّله. وعندما يستلزم اضطراب ما علاجاً دوائياً أو يندرج ضمن حالة استعجالية نفسية، يعيد الأخصائي النفسي توجيهك نحو طبيب نفسي أو نحو المستعجلات (النجدة الطبية 15).",
        ],
      },
    ],
    prix: {
      title: "أثمنة الأخصائي النفسي في المغرب",
      intro: "أتعاب الأخصائيين النفسيين حرة في القطاع الخاص. إليك فورقات إرشادية ملاحَظة حسب المدينة ونوع التكفل.",
      rows: [
        { label: "جلسة فردية (المدن الكبرى)", value: "300 – 500 درهم" },
        { label: "جلسة فردية (المدن الأخرى)", value: "250 – 400 درهم" },
        { label: "جلسة للزوجين أو الأسرة", value: "400 – 700 درهم" },
        { label: "متابعة الطفل / المراهق", value: "300 – 500 درهم" },
        { label: "استشارة عن بُعد (مرئية)", value: "250 – 450 درهم" },
      ],
      note: "أثمنة إرشادية لسنة 2026، على سبيل التوجيه. جلسات الأخصائي النفسي ليست مسترجعة بشكل منهجي من CNSS أو AMO؛ وقد تغطي بعض التأمينات التكميلية الخاصة جزءًا منها حسب العقد.",
    },
  },

  "allergologie": {
    reviewed: "2026-07-05",
    description:
      "علم الحساسية هو التخصص الطبي المخصص لتشخيص وعلاج الحساسية: التهاب الأنف التحسسي، الربو التحسسي، حساسية الأطعمة أو الأدوية، الشرى، الإكزيما وردود الفعل تجاه لسعات الحشرات. في المغرب، يتدخل طبيب الحساسية في سياق يتميز بالتعرض الكبير لحبوب اللقاح والغبار المنزلي وعث الغبار، خاصة في المدن الكبرى مثل الدار البيضاء والرباط وفاس. تتعلق أكثر أسباب الاستشارة شيوعاً بسيلان الأنف والعطس المتكرر في الربيع، ونوبات الربو وردود الفعل الجلدية. يعتمد الطبيب على استجواب دقيق واختبارات جلدية (prick-tests) وأحياناً تحاليل دموية لتحديد المادة المسببة للحساسية. ثم يقترح علاجاً مناسباً، وفي بعض الحالات إزالة التحسس (العلاج المناعي). يُمارَس علم الحساسية في القطاع العام (المستشفيات الجامعية والمستشفيات) وفي العيادات الخاصة. على SantéauMaroc، يمكنكم العثور على طبيب حساسية قريب منكم وحجز استشارتكم عبر الإنترنت مجاناً.",
    quandConsulter: [
      "العطس واحتقان الأنف أو سيلانه وحكة العينين، خاصة في الربيع أو عند وجود الغبار",
      "نوبات الربو أو ضيق التنفس أو السعال المستمر، لا سيما عند المجهود أو في الليل",
      "رد فعل بعد تناول طعام أو دواء أو بعد لسعة حشرة (احمرار، تورم، حكة)",
      "بقع الشرى أو الإكزيما المتكررة أو حكة جلدية غير مفسّرة",
      "الحاجة إلى تحديد مادة مسببة للحساسية عبر الاختبارات الجلدية أو التفكير في إزالة التحسس",
    ],
    faqs: [
      { q: "كم تكلفة استشارة طبيب الحساسية في المغرب؟", a: "في القطاع الخاص، تتراوح تكلفة استشارة الحساسية عموماً بين 300 و500 درهم في المدن الكبرى مثل الدار البيضاء والرباط، وبين 250 و400 درهم في المدن الأخرى. الأتعاب حرة وتختلف حسب الطبيب. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي على أساس التعرفة الوطنية المرجعية." },
      { q: "كيف يمكن أخذ موعد مع طبيب الحساسية في المغرب؟", a: "على SantéauMaroc، قوموا بالتصفية حسب تخصص «علم الحساسية» وحسب مدينتكم لعرض الأطباء القريبين منكم. يمكنكم الاطلاع على معلوماتهم وحجز موعدكم عبر الإنترنت مجاناً وفي أي وقت. احرصوا على تدوين أعراضكم وعلاجاتكم الحالية قبل الاستشارة." },
      { q: "كيف تجري الاختبارات الجلدية (prick-tests)؟", a: "يضع الطبيب قطرات صغيرة من المواد المسببة للحساسية على الساعد، ثم يخز الجلد خزاً خفيفاً عبر كل قطرة. يظهر رد الفعل (احمرار، تورم صغير) خلال 15 إلى 20 دقيقة إذا كنتم مصابين بالتحسس. الفحص قليل الألم وجيد التحمل، حتى عند الأطفال. يجب إيقاف بعض أدوية مضادات الهيستامين قبل الفحص بأيام." },
      { q: "هل إزالة التحسس فعّالة؟", a: "تهدف إزالة التحسس (العلاج المناعي بالمواد المسببة للحساسية) إلى تقليل الأعراض بشكل دائم تجاه مادة محددة، مثل عث الغبار أو حبوب اللقاح. تتم عن طريق تحت اللسان أو بالحقن، على مدى عدة سنوات. تعتمد فعاليتها على نوع المادة والتزام البروتوكول؛ يقيّم طبيب الحساسية ما إذا كانت مناسبة لحالتكم." },
      { q: "هل يلزم خطاب من الطبيب المعالج لزيارة طبيب الحساسية؟", a: "الوصول المباشر إلى طبيب الحساسية ممكن في القطاع الخاص. ومع ذلك، يسهّل خطاب من طبيبكم العام أو طبيب الأطفال أو طبيب الرئة المتابعة وقد يُطلب في مسار العلاج لدى CNSS أو AMO لتحسين الاسترجاع. أحضروا فحوصاتكم ووصفاتكم الطبية السابقة." },
      { q: "هل يمكن للطفل استشارة طبيب الحساسية؟", a: "نعم، غالباً ما تبدأ الحساسية منذ الطفولة (الربو، الإكزيما، حساسية الأطعمة). يستقبل العديد من أطباء الحساسية الأطفال، وبعض أطباء الأطفال مؤهلون في علم الحساسية. يمكن إجراء الاختبارات الجلدية منذ سن مبكرة. تحسّن الرعاية المبكرة جودة الحياة وتقي من المضاعفات." },
      { q: "هل يجب التوقف عن مضادات الهيستامين قبل اختبارات الحساسية ؟", a: "نعم، تُشوّش مضادات الهيستامين على اختبارات الوخز الجلدي (prick-tests) ويجب التوقف عنها عمومًا قبل الموعد بـ 5 إلى 7 أيام حسب نوع الدواء. أخبر طبيب الحساسية بجميع أدويتك، بما في ذلك بعض مضادات الاكتئاب وشراب السعال التي تحتوي على مضادات الهيستامين. في المقابل، يمكن الاستمرار في معظم علاجات الربو الأساسية والكورتيكويدات المستنشقة، لكن تأكد دائمًا من التعليمات الدقيقة عند حجز الموعد." },
      { q: "ما الفرق بين الحساسية الغذائية وعدم تحمّل الطعام ؟", a: "الحساسية الغذائية تُشرك الجهاز المناعي ويمكن أن تُحدث تفاعلات سريعة وأحيانًا خطيرة (شرى، تورّم، صدمة تأقية). أما عدم التحمّل، مثل عدم تحمّل اللاكتوز، فهو اضطراب هضمي دون آلية مناعية ولا يُسبّب خطرًا على الحياة. وحده طبيب الحساسية قادر على التمييز بينهما عبر الاستجواب والاختبارات المناسبة، لأن التكفّل ودرجة الاستعجال يختلفان تمامًا." },
      { q: "ماذا تفعل عند تفاعل تحسّسي خطير (تأق) ؟", a: "غالبًا ما يجمع التفاعل الخطير بين ضيق التنفس وتورّم الوجه أو الحلق والإغماء أو شرى منتشر: إنها حالة استعجالية مهدِّدة للحياة. اتّصل فورًا بالرقم 15 (SAMU)، وإن كان قد وُصف لك قلم أدرينالين ذاتي الحقن فاستعمله دون تأخير في الفخذ. مدّد الشخص مع رفع الساقين ولا تتركه وحده. بعد أي نوبة تأق، تصبح استشارة طبيب الحساسية ضرورية لتحديد المُحفِّز." },
    ],
    essentiel: [
      { value: "300 – 500 درهم", label: "تعرفة الاستشارة" },
      { value: "Prick-tests", label: "الفحص المرجعي للحساسية" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "أكثر أنواع الحساسية شيوعاً في المغرب",
        body: [
          "يُعد التهاب الأنف التحسسي من أكثر أسباب الاستشارة شيوعاً. يتجلى في العطس واحتقان الأنف أو سيلانه وتهيج العينين، وغالباً ما يُثار بحبوب اللقاح في الربيع، أو بعث الغبار المنزلي، أو بوبر الحيوانات. في المدن المغربية الكبرى، قد يؤدي التلوث الحضري إلى تفاقم هذه الأعراض.",
          "يكتمل المشهد بالربو التحسسي وحساسية الأطعمة (الفول السوداني، المكسرات، الحليب، البيض، السمك) وحساسية الأدوية. يُضاف إلى ذلك الشرى والإكزيما التأتبية وردود الفعل تجاه لسعات الحشرات. يميّز طبيب الحساسية بين الحساسية الحقيقية ومجرد عدم التحمل، ويحدد بدقة المادة أو المواد المسؤولة.",
        ],
      },
      {
        h: "فحوصات وأعمال طبيب الحساسية",
        body: [
          "يعتمد التشخيص أولاً على استجواب مفصل: طبيعة الأعراض، ووقت ظهورها، والبيئة، والسوابق العائلية. ثم يجري الطبيب اختبارات جلدية (prick-tests)، وهي الفحص المرجعي الذي يعرّض الجلد لمواد مختلفة مسببة للحساسية لرصد التحسس خلال دقائق.",
          "حسب الحالات، يصف طبيب الحساسية تحاليل دموية (IgE النوعية)، أو اختبارات استفزاز مؤطَّرة، أو استكشافات تنفسية مثل قياس التنفس بالنسبة للربو. تتيح هذه الفحوصات وضع تشخيص موثوق وبناء استراتيجية علاجية مخصصة، سواء تعلق الأمر بالتجنب أو الأدوية أو إزالة التحسس.",
        ],
      },
      {
        h: "العلاج وإزالة التحسس",
        body: [
          "تجمع الرعاية بين تجنب المادة المسببة للحساسية عند الإمكان، والعلاجات العرَضية (مضادات الهيستامين، الكورتيكويدات الموضعية، بخاخات الأنف، موسّعات الشعب للربو)، وتثقيف المريض للتعرف على نوباته والتعامل معها. غالباً ما تُسلَّم خطة عمل مكتوبة، خاصة في حالة الربو أو خطر الصدمة التأقية.",
          "عندما تُحدَّد المادة المسببة للحساسية جيداً، يمكن لطبيب الحساسية اقتراح إزالة التحسس (العلاج المناعي)، عبر أقراص أو قطرات تحت اللسان أو بالحقن. يهدف هذا العلاج الأساسي، الذي يستمر عدة سنوات، إلى تقليل تفاعل الجسم بشكل دائم والحد من اللجوء إلى الأدوية اليومية.",
        ],
      },
      {
        h: "الوقاية والحياة اليومية",
        body: [
          "يحسّن تقليل التعرض للمواد المسببة للحساسية الراحة بشكل واضح. ضد عث الغبار: التهوية، وغسل مفروشات السرير بحرارة عالية، والحد من السجاد والموكيت. ضد حبوب اللقاح: متابعة فترات التلقيح، والتهوية باكراً في الصباح، وتجنب الأنشطة الخارجية في أوقات الذروة. بالنسبة للحيوانات، يُحدّ من دخولها إلى الغرف.",
          "في حالة حساسية الأطعمة أو الأدوية، تُعد قراءة الملصقات بعناية والإبلاغ لكل مقدّم رعاية أمراً أساسياً. يجب على الأشخاص المعرّضين لخطر الصدمة التأقية توفير قلم أدرينالين ومعرفة كيفية استخدامه. عند حدوث تورم في الحلق أو ضيق تنفس مفاجئ أو إغماء، اتصلوا فوراً بالرقم 15 (SAMU).",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع",
        body: [
          "يُمارَس علم الحساسية في المغرب في القطاع العام (المستشفيات الجامعية والمستشفيات، بمواعيد طويلة أحياناً) وفي العيادات الخاصة، حيث يكون الوصول أسرع. غالباً ما يوجّه الطبيب العام أو طبيب الأطفال أو طبيب الرئة إلى طبيب الحساسية عندما تستمر الأعراض أو تتطلب اختبارات متخصصة.",
          "في القطاع الخاص، تكون الأتعاب حرة. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للاستشارة، يُحسَب على أساس التعرفة الوطنية المرجعية، وكذلك للفحوصات الموصوفة حسب تسعيرتها. احتفظوا بأوراق العلاج والوصفات والفواتير لتكوين ملف الاسترجاع.",
        ],
      },
      {
        h: "الحساسية والربو : علاقة لا ينبغي إهمالها",
        body: [
          "عند كثير من المرضى، ترتبط الحساسية التنفسية والربو ارتباطًا وثيقًا: فالتهاب الأنف التحسّسي غير المضبوط قد يُفاقم الربو، والعكس صحيح. يُقيّم طبيب الحساسية هذا « المسلك التنفسي الموحّد » عبر البحث عن المُحفِّزات المشتركة (عث الغبار، حبوب اللقاح، وبر الحيوانات، العفن الشائع في المساكن الرطبة) وقياس تأثيرها على التنفس. إن التكفّل الشامل بالأنف والقصبات يُعطي نتائج أفضل من علاج الأعراض بشكل منفصل.",
          "في المغرب، يؤثّر المناخ المتباين بين الجهات على درجة التعرّض: تركيز عالٍ لعث الغبار على الساحل الرطب، وذروات لحبوب اللقاح في الربيع داخل المناطق القارية، وغبار في الفترات الجافة. يُكيّف طبيب الحساسية نصائح التجنّب والعلاج الأساسي مع هذا السياق، بالتنسيق مع طبيب أمراض الرئة إذا كان الربو شديدًا. وفي حال نوبة ربو حادة مع ضيق تنفّس شديد لا يستجيب لعلاج الإسعاف، يجب الاتصال بالرقم 15 (SAMU) دون تأخير.",
        ],
      },
    ],
    prix: {
      title: "تعرفات إرشادية في علم الحساسية بالمغرب",
      intro: "الأتعاب في علم الحساسية حرة في القطاع الخاص وتختلف حسب المدينة والطبيب والفحوصات المنجَزة. إليكم فيما يلي نطاقات إرشادية مسجَّلة سنة 2026.",
      rows: [
        { label: "استشارة الحساسية (المدن الكبرى)", value: "300 – 500 درهم" },
        { label: "استشارة الحساسية (المدن الأخرى)", value: "250 – 400 درهم" },
        { label: "الاختبارات الجلدية (prick-tests، مجموعة)", value: "400 – 900 درهم" },
        { label: "تحليل دموي لـ IgE النوعية", value: "300 – 800 درهم" },
        { label: "جلسة / متابعة إزالة التحسس", value: "200 – 500 درهم" },
      ],
      note: "نطاقات إرشادية لسنة 2026، للعلم فقط ودون قيمة تعاقدية. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي على أساس التعرفة الوطنية المرجعية. اطلبوا تقديراً للثمن من الطبيب قبل أي فحص.",
    },
  },

  "medecine-du-sport": {
    reviewed: "2026-07-05",
    description:
      "الطب الرياضي هو التخصص الذي يرافق الرياضيين بمختلف مستوياتهم، من الهاوي المرخّص إلى المنافس، إضافة إلى الأشخاص الذين يستأنفون النشاط البدني. في المغرب، يعمل طبيب الطب الرياضي أساساً في القطاع الخاص وداخل الجامعات الرياضية والأندية والمراكز الطبية الرياضية، مع حضور واضح في الدار البيضاء والرباط ومراكش. يسلّم الشهادة الطبية لعدم وجود مانع لممارسة الرياضة، ويجري تقييم اللياقة واختبار الجهد، ويقي من الإصابات ويعالجها (الالتواءات، التهابات الأوتار، التمزقات العضلية)، وينظّم استئناف النشاط بعد الإصابة، ويقدّم النصح حول التغذية والترطيب. الطلب على الشهادات شائع في المغرب، خصوصاً للانخراط في الأندية والمشاركة في المنافسات والوسط المدرسي. الأتعاب حرة في القطاع الخاص وتختلف حسب المدينة والفحوصات المنجزة. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لثمن الاستشارة الطبية. عبر SantéauMaroc تجد طبيب طب رياضي قربك وتحجز عبر الإنترنت مجاناً.",
    quandConsulter: [
      "تحتاج إلى شهادة طبية بعدم وجود مانع للانخراط في نادٍ أو المشاركة في منافسة أو استئناف ممارسة الرياضة",
      "تشعر بألم مستمر بعد المجهود (التهاب وتر، ألم في الركبة أو الكتف أو وتر أخيل)",
      "تعرّضت لإصابة رياضية (التواء، تمزق عضلي، تمزق) وترغب في العلاج واستئناف مؤطَّر للنشاط",
      "ترغب في تقييم اللياقة أو اختبار الجهد قبل بدء نشاط مكثّف أو الاستئناف بعد انقطاع طويل",
      "تبحث عن نصائح شخصية حول التغذية والترطيب والوقاية من الإصابات لتحسين أدائك",
    ],
    faqs: [
      { q: "كم تكلّف استشارة طبيب الطب الرياضي في المغرب؟", a: "الأتعاب حرة في القطاع الخاص. تتراوح الاستشارة عموماً بين 300 و600 درهم في المدن الكبرى مثل الدار البيضاء والرباط ومراكش، وبين 250 و450 درهماً في المدن الأخرى. تُحتسب الفحوصات الإضافية (اختبار الجهد، الفحص بالصدى) بشكل منفصل. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "كيف تحجز موعداً مع طبيب طب رياضي في المغرب؟", a: "عبر SantéauMaroc، صفِّ حسب تخصص « الطب الرياضي » وحسب مدينتك لمقارنة الأطباء المتاحين. تطّلع على أوقات توفّرهم وتحجز عبر الإنترنت مجاناً في بضع نقرات. يمكنك أيضاً تحديد سبب الزيارة (شهادة، إصابة، تقييم) عند حجز الموعد." },
      { q: "هل يسلّم طبيب الطب الرياضي شهادة عدم وجود مانع؟", a: "نعم، وهي من أكثر أعماله شيوعاً. بعد فحص سريري (وأحياناً تخطيط للقلب أو اختبار جهد حسب العمر ونوع الرياضة)، يسلّم شهادة عدم وجود مانع لممارسة الرياضة، ترفيهاً أو في المنافسة. غالباً ما تطلب الأندية والجامعات هذه الوثيقة." },
      { q: "متى يكون اختبار الجهد ضرورياً؟", a: "يُنصح باختبار الجهد قبل الممارسة المكثّفة أو في المنافسة، لدى الرياضيين فوق 35-40 سنة، في حال وجود عوامل خطر قلبية وعائية (التدخين، ارتفاع الضغط، السكري، سوابق عائلية) أو أعراض عند المجهود. يقيّم طبيب الطب الرياضي كل حالة على حدة لتحديد مدى الحاجة إليه." },
      { q: "بعد الإصابة، هل تستشير طبيب طب رياضي أم أخصائي ترويض؟", a: "يضع طبيب الطب الرياضي التشخيص، ويصف الفحوصات (تصوير بالأشعة، فحص بالصدى، IRM)، وينسّق العلاج بما في ذلك إعادة التأهيل. ثم يجري أخصائي الترويض حصص إعادة التأهيل الموصوفة. غالباً ما يعمل الطرفان بتكامل من أجل استئناف آمن للنشاط." },
      { q: "هل تُسترجع استشارة الطب الرياضي في المغرب؟", a: "يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لثمن الاستشارة الطبية، يُحتسب على أساس التعريفة الوطنية المرجعية (TNR). الشهادة الإدارية الصرفة وبعض الأعمال غير الضرورية طبياً لا تُغطّى دائماً. احتفظ بورقة العلاجات من أجل الاسترجاع." },
      { q: "في أي سن يمكن للطفل أو المراهق استشارة طبيب رياضي؟", a: "يمكن للطفل أو المراهق الذي يمارس نشاطاً مكثفاً أو تنافسياً الاستفادة من متابعة منذ سن مبكرة، غالباً بطلب من النادي أو عند استخراج شهادة اللياقة. يراقب الطبيب الرياضي النمو، ويكيّف أحمال التدريب، ويكشف أمراض النمو (مثل آلام الركبة أو الكعب الشائعة لدى الرياضي الصغير). في المغرب، تتم هذه المتابعة في القطاع الخاص أو أحياناً عبر الهياكل الفدرالية لرياضيي النخبة." },
      { q: "هل يمكن لطبيب الرياضة إجراء الحقن الموضعي؟", a: "نعم، يمكن لطبيب الرياضة إجراء الحقن الموضعي (الكورتيزون، حمض الهيالورونيك، أو حتى PRP حسب تكوينه) لعلاج بعض التهابات الأوتار أو الإصابات المفصلية. يُقترح هذا الإجراء بعد الفحص وأحياناً بعد التصوير، عندما لا تكفي العلاجات الأبسط. منتجات مثل PRP لا تُسترجع عادة من طرف CNSS أو AMO وتبقى على عاتق المريض." },
      { q: "ماذا أفعل في حالة إغماء أو ألم في الصدر أثناء المجهود؟", a: "الإغماء أو فقدان الوعي أو الألم في الصدر أثناء المجهود هي إشارات إنذار لا ينبغي الاستهانة بها أبداً. يجب التوقف فوراً عن النشاط، وإذا استمرت الأعراض أو تفاقمت، الاتصال بالرقم 15 (SAMU) دون انتظار. خارج الحالات الطارئة، تستدعي هذه العلامات فحصاً قلبياً شاملاً قبل أي استئناف، غالباً بتوجيه من طبيب الرياضة." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة في المدن الكبرى" },
      { value: "شهادة اللياقة", label: "أكثر أعمال التخصص طلباً" },
      { value: "CNSS · AMO", label: "استرجاع جزئي للاستشارة" },
    ],
    sections: [
      {
        h: "الإصابات الرياضية: أكثر أسباب الاستشارة شيوعاً",
        body: [
          "يتكفّل طبيب الطب الرياضي بأغلب الإصابات المرتبطة بالنشاط البدني: التواءات الكاحل أو الركبة، التهابات الأوتار (وتر أخيل، الكتف، مرفق لاعب التنس)، الإصابات العضلية (التمزقات)، آلام الظهر وكسور الإجهاد. هذه الأسباب شائعة في المغرب، خصوصاً مع رواج كرة القدم والجري واللياقة البدنية.",
          "يبدأ العلاج بفحص سريري دقيق، يُستكمل عند الحاجة بالتصوير (بالأشعة، بالصدى، IRM). ثم يقترح الطبيب علاجاً ملائماً: راحة نسبية، تبريد، مسكّنات، دعامات، إعادة تأهيل، أو نادراً استشارة جراحية. الهدف هو تخفيف الألم مع الحفاظ على مستقبل الرياضي.",
        ],
      },
      {
        h: "تقييم اللياقة واختبار الجهد والشهادة",
        body: [
          "قبل بدء الممارسة أو تكثيفها، يتيح تقييم اللياقة تقدير الحالة القلبية الوعائية والتنفسية والمفصلية. يشمل استجواباً حول السوابق، وفحصاً سريرياً كاملاً، وحسب الحالة تخطيطاً للقلب في الراحة أو اختبار جهد. يهدف هذا الكشف إلى استبعاد الموانع والوقاية من الحوادث الخطيرة عند المجهود.",
          "في ختام التقييم، يسلّم طبيب الطب الرياضي شهادة عدم وجود مانع، وهي مطلوبة للانخراط في الأندية والمنافسات وأحياناً في الوسط المدرسي. يُنصح باختبار الجهد، الذي يُجرى على جهاز المشي أو الدراجة مع مراقبة القلب، خصوصاً للرياضيين فوق 35-40 سنة أو حاملي عوامل الخطر.",
        ],
      },
      {
        h: "استئناف النشاط بعد الإصابة والوقاية",
        body: [
          "استئناف الرياضة بعد الإصابة مرحلة أساسية غالباً ما تُهمَل، وتعرّض للانتكاس عند التسرّع فيها. يحدّد طبيب الطب الرياضي جدولاً لاستئناف تدريجي، ملائم لنوع الإصابة والرياضة الممارَسة، بالتنسيق مع أخصائي الترويض. ويصادق على معايير العودة إلى الميدان للحدّ من خطر النكس.",
          "تحتل الوقاية مكانة محورية: الإحماء، تقوية العضلات، تصحيح الحركات التقنية، اختيار المعدات، وتدبير حِمل التمارين. كما ينصح الطبيب حول الترطيب والاستشفاء، وهما مهمان بشكل خاص أثناء الحرارة الشديدة في المغرب، للحدّ من الإصابات والتوعّكات عند المجهود.",
        ],
      },
      {
        h: "التغذية والترطيب والأداء",
        body: [
          "تؤثر التغذية مباشرة في الأداء والاستشفاء وخطر الإصابة. يقيّم طبيب الطب الرياضي الاحتياجات الطاقية حسب الاختصاص ووتيرة التمارين والأهداف، ويصحّح الاختلالات الشائعة (نقص المدخول، العوز، الوزن غير الملائم). ويوجّه نحو تغذية متوازنة بدل الحميات أو المكمّلات غير المبرّرة.",
          "الترطيب رهان كبير في المغرب، حيث تزيد الحرارة من الفقد المائي وخطر التشنجات أو ضربة الحر. يقدّم الطبيب معالم ملموسة قبل المجهود وأثناءه وبعده. ويبقى يقظاً تجاه المكمّلات والمواد المنشّطة، ويذكّر بقواعد السلامة، خصوصاً لدى الرياضيين الشباب.",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع في المغرب",
        body: [
          "في المغرب، يمارس طبيب الطب الرياضي أساساً في العيادة الخاصة والمصحّات وداخل الجامعات الرياضية والأندية المحترفة والمراكز الطبية الرياضية. يُلجأ إليه بحرية، دون مرور إلزامي عبر طبيب معالج. وحسب السبب، قد يتعاون مع أطباء العظام والقلب وأخصائيي الترويض والأشعة من أجل تكفّل شامل.",
          "على المستوى المالي، الأتعاب حرة في القطاع الخاص. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لثمن الاستشارة الطبية، على أساس التعريفة الوطنية المرجعية. قد تُغطّى بعض الأعمال التقنية (اختبار الجهد، التصوير) جزئياً بوصفة طبية، في حين لا تُغطّى الشهادات الإدارية دائماً.",
        ],
      },
      {
        h: "متابعة الرياضي الهاوي والرياضي رفيع المستوى",
        body: [
          "لا يواكب طبيب الرياضة رياضيي المنافسات فقط: بل يتوجه أيضاً إلى عدّاء نهاية الأسبوع، وممارس قاعة الرياضة، أو الشخص الذي يستأنف نشاطاً بعد انقطاع طويل. لدى الرياضي الهاوي، يكون الهدف بالأساس الوقاية من الإصابات، وتكييف الحمل مع الحالة الحقيقية، والكشف عن مشكل قلبي أو مفصلي قبل أن يصبح معيقاً.",
          "لدى الرياضي رفيع المستوى، تصبح المتابعة أكثر تقارباً وتعدد التخصصات: فحوصات منتظمة، وتحسين التعافي، والوقاية من الإفراط في التدريب، والتنسيق مع أخصائي الترويض الطبي وأخصائي التغذية وأطر النادي. في المغرب، غالباً ما تمر هذه المتابعة المعزَّزة عبر هياكل فدرالية أو مراكز خاصة متخصصة، بينما يستشير الرياضي الهاوي في أغلب الأحيان في عيادة بالمدينة.",
        ],
      },
    ],
    prix: {
      title: "أثمنة الطب الرياضي في المغرب",
      intro: "الأتعاب حرة في القطاع الخاص وتختلف حسب المدينة وخبرة الطبيب والفحوصات المنجزة. إليك فئات أسعار إرشادية مسجَّلة سنة 2026.",
      rows: [
        { label: "الاستشارة (المدن الكبرى: الدار البيضاء، الرباط، مراكش)", value: "300 – 600 درهم" },
        { label: "الاستشارة (المدن الأخرى)", value: "250 – 450 درهم" },
        { label: "شهادة عدم وجود مانع (استشارة مخصّصة)", value: "200 – 400 درهم" },
        { label: "اختبار الجهد مع تخطيط القلب", value: "500 – 1200 درهم" },
        { label: "فحص بالصدى للعضلات والأوتار", value: "300 – 700 درهم" },
      ],
      note: "فئات أسعار إرشادية لسنة 2026، معطيات لأغراض إعلامية وغير تعاقدية. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لثمن الاستشارة الطبية على أساس التعريفة الوطنية المرجعية (TNR). تأكّد دائماً من الأثمنة لدى العيادة عند حجز الموعد.",
    },
  },

  "nutrition": {
    reviewed: "2026-07-05",
    description:
      "التغذية هي التخصص الذي يواكب التحكم في الوزن والسكري والكوليسترول والتوازن الغذائي في الحياة اليومية. وفي المغرب، تحتل مكانة متزايدة أمام انتشار زيادة الوزن والسمنة والسكري من النوع الثاني، سواء في المدن الكبرى أو في المناطق الأخرى. ومن المهم التمييز بين مهنيين كثيراً ما يقع الخلط بينهما: الطبيب المختص في التغذية، وهو دكتور في الطب قادر على وضع التشخيص ووصف الفحوصات والأدوية ومتابعة الحالات الطبية المعقدة؛ وأخصائي الحمية، وهو مهني شبه طبي متخصص في إعداد البرامج الغذائية العملية والتربية الغذائية. ويعمل كلاهما في العيادات الخاصة أو في المصحات أو في المستشفى العمومي، وغالباً بتنسيق مع طبيب الغدد أو طبيب القلب أو الطبيب المعالج. على SantéauMaroc، يمكنك مقارنة الممارسين حسب المدينة، والتحقق من لغاتهم والتعاقد، ثم حجز موعد عبر الإنترنت مجاناً.",
    quandConsulter: [
      "زيادة الوزن أو السمنة التي ترغب في علاجها بشكل دائم، دون حميات متكررة غير فعالة.",
      "السكري أو ما قبل السكري أو الكوليسترول أو ارتفاع الضغط الدموي الذي يتطلب إعادة توازن غذائي مؤطر.",
      "التعب أو اضطرابات الهضم أو نقص محتمل مرتبط بتغذيتك.",
      "اضطراب في السلوك الغذائي: نوبات الأكل، الشره المرضي، التقييد المفرط، علاقة صعبة بالطعام.",
      "متابعة غذائية خاصة: الحمل، الرياضي، المسن، قبل أو بعد جراحة السمنة.",
    ],
    faqs: [
      { q: "ما الفرق بين الطبيب المختص في التغذية وأخصائي الحمية؟", a: "الطبيب المختص في التغذية هو دكتور في الطب: يمكنه التشخيص ووصف التحاليل والأدوية ومتابعة الأمراض. أما أخصائي الحمية فهو مهني شبه طبي متخصص في البرامج الغذائية والتربية الغذائية، دون وصف طبي. وكلاهما مكمل للآخر حسب حالتك." },
      { q: "كم تكلف استشارة التغذية في المغرب؟", a: "في القطاع الخاص، الأتعاب حرة. احسب عموماً ما بين 300 و500 درهم في المدن الكبرى مثل الدار البيضاء أو الرباط أو مراكش، وما بين 200 و400 درهم في المدن الأخرى. الاستشارة الأولى، الأطول، قد تكون أغلى قليلاً. تبقى الأسعار إرشادية وتختلف حسب الممارس." },
      { q: "هل استشارة التغذية قابلة للاسترجاع؟", a: "استشارة لدى طبيب مختص في التغذية قد تمنح الحق في استرجاع جزئي: يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع حوالي 80٪ من التعريفة الوطنية المرجعية لاستشارة طبية أساسية. أما أعمال أخصائيي الحمية والحصائل الغذائية فغالباً ما تكون قليلة التغطية أو غير مغطاة." },
      { q: "هل تلزم وصفة أو رسالة من الطبيب المعالج؟", a: "لا، يمكنك استشارة أخصائي التغذية مباشرة دون المرور عبر طبيبك المعالج. ومع ذلك فإن رسالة أو حصائل حديثة (السكر، الحصيلة الدهنية، الغدة الدرقية) مفيدة لتوجيه العلاج. أحضر آخر نتائج تحاليلك إن كانت لديك." },
      { q: "كم عدد الجلسات اللازمة لإنقاص الوزن؟", a: "لا يوجد عدد ثابت. غالباً ما تعتمد المتابعة الدائمة على استشارة أولى ثم مواعيد متابعة موزعة على عدة أشهر. الهدف ليس حمية سريعة بل تغيير مستقر للعادات، ملائم لنمط حياتك وصحتك." },
      { q: "كيف أحجز موعداً مع أخصائي التغذية في المغرب؟", a: "على SantéauMaroc، صفِّ حسب تخصص التغذية، واختر مدينتك وقارن بين الممارسين حسب لغاتهم والتعاقد والمواعيد المتاحة. يمكنك بعد ذلك حجز موعدك عبر الإنترنت مجاناً، ببضع نقرات، في الوقت الذي يناسبك." },
      { q: "هل يمكن إجراء المتابعة الغذائية عن بُعد عبر الاستشارة المرئية؟", a: "نعم، يقترح العديد من أخصائيي التغذية اليوم مواعيد متابعة عبر الاستشارة المرئية، وهي عملية بعد جلسة أولى حضورية. يناسب هذا الشكل تعديل الخطة الغذائية أو مراجعة التحاليل أو الحفاظ على التحفيز بين استشارتين. تبقى الزيارة الأولى غالباً موصى بها في العيادة لأخذ القياسات والفحص. على SantéauMaroc، تحقق مما إذا كان الطبيب يشير إلى تقديمه الاستشارة عن بُعد." },
      { q: "كيف تُحضّر جيداً استشارتك الأولى في التغذية؟", a: "دوّن خلال يومين أو ثلاثة ما تأكله وتشربه فعلاً، دون تغيير أي شيء، لإعطاء صورة صادقة عن عاداتك. أحضر آخر تحاليلك (السكر، الملف الدهني، الغدة الدرقية، الحديد)، ولائحة أدويتك، وأهدافك الملموسة. حضّر أيضاً أسئلتك وقيود حياتك (العمل، المواقيت، الميزانية)، لأن الخطة الواقعية تُبنى حول حياتك اليومية." },
      { q: "هل النشاط البدني ضروري إلى جانب المتابعة الغذائية؟", a: "تبقى التغذية العامل الأساسي، لكن الحركة المنتظمة تعزز بقوة آثارها على الوزن والسكري والكوليسترول. يأخذ أخصائي التغذية بعين الاعتبار لياقتك البدنية وأمراضك المحتملة لينصح بنشاط تدريجي ومناسب. في حالة مرض قلبي أو سمنة مفرطة، يُستحسن استشارة طبية مسبقة قبل استئناف الرياضة." },
    ],
    essentiel: [
      { value: "300 – 500 درهم", label: "سعر الاستشارة" },
      { value: "طبيب أو أخصائي حمية", label: "صنفان متكاملان" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "أكثر أسباب الاستشارة شيوعاً",
        body: [
          "تشكل زيادة الوزن والسمنة أولى أسباب استشارة التغذية في المغرب، حيث تنتشر هذه الحالات في المدينة كما في البادية. يقيّم أخصائي التغذية الوزن وتوزيع الدهون والعادات الغذائية والنشاط البدني، ثم يبني مواكبة شخصية بدل حمية تقييدية قصيرة المدى.",
          "ثم تأتي الأمراض الأيضية: السكري من النوع الثاني، ما قبل السكري، فرط الكوليسترول وارتفاع الضغط الدموي، المرتبطة غالباً بالتغذية. كما يتدخل أخصائي التغذية في اضطرابات الهضم والنقص وتغذية المرأة الحامل والرياضي والمسن، وكذلك في اضطرابات السلوك الغذائي.",
        ],
      },
      {
        h: "الحصيلة الغذائية والفحوصات المفيدة",
        body: [
          "تبدأ الاستشارة باستجواب مفصل: السوابق، نمط الحياة، العادات الغذائية والأهداف. يجري الممارس قياسات (الوزن، الطول، محيط الخصر، أحياناً تركيب الجسم) ويحلل مفكرة غذائية لفهم مدخولك الحقيقي في اليومي.",
          "يمكن للطبيب المختص في التغذية أن يصف فحوصات تكميلية: السكر على الريق أو الخضاب السكري، الحصيلة الدهنية، حصيلة الكبد، الغدة الدرقية أو معايرة الفيتامينات والحديد. توجّه هذه النتائج البرنامج الغذائي وتتيح الكشف عن مضاعفات محتملة، بتنسيق عند الحاجة مع طبيب الغدد أو طبيب القلب.",
        ],
      },
      {
        h: "الوقاية وإعادة التوازن الغذائي",
        body: [
          "لا تقتصر التغذية على إنقاص الوزن: بل تهدف قبل كل شيء إلى الوقاية من الأمراض المزمنة وتبني عادات جيدة دائمة. يساعد الممارس على تنظيم الوجبات واختيار الأطعمة بشكل أفضل وتكييف الطبق مع الثقافة الطهوية المغربية بدل فرض نموذج أجنبي.",
          "تحتل التربية الغذائية مكانة مركزية: فهم الملصقات، التحكم في السكريات والدهون المخفية، تكييف التغذية خلال رمضان أو عند الإصابة بالسكري. تشجع هذه المواكبة التدريجية على نتائج مستقرة وتتجنب أثر اليويو للحميات الصارمة.",
        ],
      },
      {
        h: "الاسترجاع ومسار العلاج",
        body: [
          "استشارة لدى طبيب مختص في التغذية هي عمل طبي قد يمنح استرجاعاً جزئياً للمؤمَّنين لدى CNSS أو AMO، يُحتسب عموماً على أساس التعريفة الوطنية المرجعية لاستشارة طبية أساسية. احتفظ بأوراق العلاج والإثباتات لطلب الاسترجاع.",
          "في المقابل، غالباً ما تكون استشارات أخصائي الحمية وبعض الحصائل الغذائية على نفقتك في القطاع الخاص. تندرج التغذية في مسار أوسع: يمكن لطبيبك المعالج أو طبيب الغدد أو طبيب القلب أن يوجّه نحو أخصائي التغذية، خاصة في حالة السكري أو مرض القلب والشرايين.",
        ],
      },
      {
        h: "حالات خاصة: الجراحة واضطرابات الأكل والطفل",
        body: [
          "تتطلب بعض الحالات متابعة غذائية دقيقة. قبل وبعد جراحة السمنة (السليف، الباي باس)، تكون المواكبة ضرورية لتحضير العملية والوقاية من النقص وتكييف التغذية بشكل دائم. يعمل أخصائي التغذية حينها ضمن فريق مع الجرّاح.",
          "تستوجب اضطرابات السلوك الغذائي (فقدان الشهية، الشره المرضي، نوبات الأكل) علاجاً متعدد التخصصات يجمع أخصائي التغذية والطبيب وأحياناً الأخصائي النفسي. أما عند الطفل والمراهق الذي يعاني زيادة الوزن، فالهدف مواكبة عائلية لطيفة، دون حمية صارمة، للحفاظ على النمو وعلى العلاقة بالطعام.",
        ],
      },
      {
        h: "التغذية خلال شهر رمضان والصيام",
        body: [
          "يُغيّر رمضان بعمق إيقاع الوجبات ويمثل انشغالاً متكرراً في المغرب. يساعد أخصائي التغذية على تنظيم الفطور والسحور لتفادي الإفراط في السكريات السريعة والمقليات، والحفاظ على ترطيب جيد بين الوجبتين، والوقاية من التعب أو الصداع أو نوبات الجوع الليلية. الهدف هو اجتياز الشهر دون اختلال أو زيادة في الوزن.",
          "يتطلب الصيام يقظة خاصة لدى المصابين بالسكري أو ارتفاع الضغط أو مرض مزمن. تُعد الاستشارة الطبية ضرورية قبل الصيام في هذه الحالات، لأن تعديل الأدوية والمواقيت من اختصاص الطبيب. في حالة الإغماء أو انخفاض حاد في السكر أو علامات جفاف شديد، يجب عدم التردد في الإفطار والاتصال بالرقم 15 (المساعدة الطبية المستعجلة) إذا كانت الحالة مقلقة.",
        ],
      },
    ],
    prix: {
      title: "أسعار أخصائي التغذية في المغرب",
      intro: "في القطاع الخاص، الأتعاب حرة وتختلف حسب المدينة ونوع الممارس (طبيب أو أخصائي حمية) ومدة الاستشارة. إليك فئات إرشادية للاسترشاد بها.",
      rows: [
        { label: "الاستشارة الأولى (حصيلة)", value: "350 – 600 درهم" },
        { label: "استشارة المتابعة", value: "200 – 400 درهم" },
        { label: "استشارة أخصائي الحمية", value: "150 – 350 درهم" },
        { label: "تحليل تركيب الجسم", value: "100 – 250 درهم" },
        { label: "برنامج مواكبة (عدة جلسات)", value: "800 – 2 500 درهم" },
      ],
      note: "أسعار إرشادية لسنة 2026، يُنصح بتأكيدها لدى الممارس. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لاستشارة لدى طبيب مختص في التغذية؛ أما أعمال أخصائيي الحمية فغالباً ما تكون قليلة الاسترجاع أو غير مسترجعة.",
    },
  },

  "medecine-esthetique": {
    reviewed: "2026-07-05",
    description:
      "يجمع طب التجميل الأعمال الطبية غير الجراحية التي تهدف إلى تصحيح أو الوقاية من علامات الشيخوخة وتحسين مظهر الوجه والجسم. في المغرب، يمارسه أطباء مؤهلون (أطباء الجلد أو أطباء التجميل أو الجراحون) في عيادات خاصة، خاصة في الدار البيضاء والرباط ومراكش وطنجة. أكثر التقنيات شيوعاً هي حقن حمض الهيالورونيك وتوكسين البوتولينوم (البوتوكس)، والتقشير الكيميائي، والميزوثيرابي، وعلاجات الليزر. وخلافاً لجراحة التجميل، تُجرى هذه الأعمال دون تخدير عام، مع فترة نقاهة قصيرة أو منعدمة. نقطة مهمة: هي أعمال طبية مقتصرة على الأطباء، وليست ذات غاية علاجية؛ لذلك فهي غير مُستَرجَعة من طرف CNSS أو AMO. إن اختيار طبيب مؤهل ومصرَّح به أمر أساسي لسلامتكم. عبر SantéauMaroc، يمكنكم تحديد الأطباء الممارسين لطب التجميل بالقرب منكم وحجز موعد بكل ثقة.",
    quandConsulter: [
      "ترغبون في تخفيف تجاعيد الجبهة أو تجاعيد زاوية العين أو تجعيدة الأسد",
      "تريدون استعادة حجم مفقود على مستوى الوجنتين أو الشفتين أو الهالات الغائرة",
      "بشرتكم باهتة أو تعاني من بقع صبغية وآثار ندبات حب الشباب",
      "تلاحظون تساقطاً للشعر أو ترهلاً جلدياً مبتدئاً",
      "تفكرون في إجراء عمل تجميلي وتبحثون عن رأي طبي مسبق جاد",
    ],
    faqs: [
      { q: "كم تكلف استشارة طب التجميل في المغرب؟", a: "تتراوح استشارة التقييم عموماً بين 300 و600 درهم في المدن الكبرى، وبين 250 و450 درهم في المدن الأخرى. الأتعاب حرة في القطاع الخاص وتختلف حسب المدينة والطبيب. تهدف هذه الاستشارة الأولى، التي تُخصم أحياناً من ثمن العمل، إلى وضع خطة علاج مخصصة." },
      { q: "هل طب التجميل مُستَرجَع من طرف CNSS أو AMO؟", a: "لا. أعمال طب التجميل ليست ذات غاية علاجية وتُعتبر من قبيل الرفاهية: فهي غير مُستَرجَعة لا من CNSS ولا من AMO. يجب عليكم أداء كامل الأتعاب. وحدها بعض الأعمال ذات الغاية الطبية المعترف بها (علاج مرض جلدي مثلاً) قد تفتح أحياناً الحق في استرجاع جزئي." },
      { q: "من يحق له ممارسة الحقن والأعمال التجميلية في المغرب؟", a: "الحقن (حمض الهيالورونيك، البوتوكس) والليزر الطبي والتقشير هي أعمال طبية مقتصرة على الأطباء المسجلين في الهيئة. احذروا معاهد التجميل أو الأشخاص غير الأطباء الذين يقترحون هذه الحقن: خطر المضاعفات حقيقي. تحققوا دائماً من تأهيل الطبيب قبل أي عمل." },
      { q: "هل حقن حمض الهيالورونيك والبوتوكس مؤلمة؟", a: "عدم الراحة عموماً خفيف وقصير الأمد. غالباً ما يُستعمل كريم مخدّر أو منتجات تحتوي على مخدر موضعي بالنسبة لحمض الهيالورونيك. أما البوتوكس فيُجرى بإبر دقيقة جداً ويسبب انزعاجاً بسيطاً. قد تظهر احمرارات أو كدمات صغيرة عابرة تختفي خلال بضعة أيام." },
      { q: "كم تدوم نتائج العلاج التجميلي؟", a: "يتوقف ذلك على نوع العمل. يستمر مفعول البوتوكس حوالي 4 إلى 6 أشهر، وحمض الهيالورونيك من 6 إلى 18 شهراً حسب المنطقة والمنتج. غالباً ما يتطلب التقشير والميزوثيرابي عدة جلسات للحصول على نتيجة مثلى. سيوضح لكم الطبيب وتيرة الصيانة خلال الاستشارة." },
      { q: "كيف أحجز موعداً مع طبيب تجميل في المغرب؟", a: "عبر SantéauMaroc، صفّوا حسب تخصص «طب التجميل» وحسب المدينة للعثور على طبيب بالقرب منكم. تطّلعون على ملفه وأعماله وآراء المرضى، ثم تحجزون عبر الإنترنت مجاناً الموعد الذي يناسبكم. حجز الموعد بسيط وبدون أي رسوم إضافية." },
      { q: "ما الفرق بين الطب التجميلي والجراحة التجميلية؟", a: "يجمع الطب التجميلي أعمالاً غير جراحية (الحقن، التقشير، الليزر، الميزوثيرابي) تُجرى في العيادة دون غرفة عمليات ولا تخدير عام. أما الجراحة التجميلية (شد الوجه، تجميل الأنف، شفط الدهون) فهي عمل جراحي يقوم به جرّاح تجميل، مع تخدير وفترة نقاهة حقيقية. الاختصاصان متمايزان ومتكاملان، وسيوجّهك طبيبك إلى جرّاح إذا تجاوز طلبك مجال الطب غير الجراحي." },
      { q: "هل هناك فترة توقف عن النشاط بعد عمل من أعمال الطب التجميلي؟", a: "أغلب الأعمال لا تتطلب توقفاً يُذكر عن النشاط؛ فبعد البوتوكس أو حمض الهيالورونيك يمكنك استئناف نشاطك في اليوم نفسه، مع احمرار خفيف أو كدمات صغيرة عابرة أحياناً. بعض الأعمال الأقوى مثل التقشير العميق أو الليزر التجزيئي تُسبب احمراراً وتقشّراً لبضعة أيام. يوضح لك الطبيب مسبقاً ما هو متوقع كي تنظّم مواعيدك." },
      { q: "في أي سن يمكن البدء بالطب التجميلي؟", a: "لا توجد سن واحدة؛ فالأمر يتوقف على الطلب وحالة البشرة لا على رقم معيّن. قد تعني الأعمال الوقائية الخفيفة (الترطيب، تحسين جودة البشرة) بالغين شباباً، بينما تُدرَس معالجة التجاعيد لاحقاً عند ظهور العلامات. هذه الأعمال مخصّصة للبالغين، ويرفض الطبيب الجاد أي إجراء تجميلي غير مبرَّر لدى القاصر ويفضّل دائماً النتيجة الطبيعية." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "أعمال غير جراحية", label: "دون تخدير عام" },
      { value: "غير مُستَرجَع", label: "عمل تجميلي للرفاهية" },
    ],
    sections: [
      {
        h: "أهم أعمال طب التجميل",
        body: [
          "يقترح طب التجميل مجموعة من الأعمال غير الجراحية التي تُجرى في العيادة. حقن توكسين البوتولينوم (البوتوكس) ترخي العضلات المسؤولة عن تجاعيد التعبير في الجبهة ومحيط العينين. أما حقن حمض الهيالورونيك فتملأ التجاعيد وتستعيد أحجام الوجه (الوجنتان، الشفتان، الهالات) وترطب البشرة في العمق.",
          "تُضاف إلى هذه التقنيات التقشير الكيميائي الذي يقشّر البشرة لعلاج البشرة الباهتة والبقع وآثار حب الشباب، والميزوثيرابي الذي ينشّط البشرة أو يحارب تساقط الشعر، وعلاجات الليزر لإزالة الشعر أو البقع أو تجديد البشرة. يكيّف الطبيب البروتوكول مع بشرتكم وتطلعاتكم.",
        ],
      },
      {
        h: "الاستشارة والتقييم المسبق",
        body: [
          "الاستشارة الأولى مرحلة أساسية وليست عابرة أبداً. يحلل الطبيب بشرتكم وبنيتكم الجسدية وتطلعاتكم، ويبحث عن موانع محتملة (الحمل، الحساسية، العلاجات الجارية، أمراض المناعة الذاتية)، ويطلعكم على النتائج الواقعية التي يمكن توقعها.",
          "كما أنها لحظة تناول المخاطر والعواقب الممكنة والميزانية. الطبيب الجاد لا يقترح أبداً عملاً تحت الضغط ويحترم مدة للتفكير. يجب أن يُسلَّم لكم عرض أثمان واضح. تحميكم هذه المقاربة الحذرة وتضمن أن العمل المقترح يستجيب فعلاً لحاجياتكم.",
        ],
      },
      {
        h: "السلامة والمضاعفات والممارسات الجيدة",
        body: [
          "رغم أنها قليلة التدخل، تبقى أعمال طب التجميل حركات طبية تنطوي على مخاطر: كدمات، وذمة، عدوى، رد فعل تحسسي، أو نتيجة غير متناظرة. بعض المضاعفات، كانسداد وعائي بعد حقن حمض الهيالورونيك، نادرة لكنها خطيرة وتستلزم تكفلاً طبياً فورياً.",
          "للحد من هذه المخاطر، اختاروا طبيباً مؤهلاً يستعمل منتجات مرخصة، في عيادة تحترم قواعد النظافة. تجنبوا الأثمان المنخفضة بشكل غير طبيعي والحقن المُجراة خارج الإطار الطبي. في حال ألم شديد أو ابيضاض البشرة أو اضطراب بصري بعد عمل ما، اتصلوا دون تأخير بطبيبكم أو بالمستعجلات (15، SAMU).",
        ],
      },
      {
        h: "الكلفة وغياب الاسترجاع",
        body: [
          "أعمال طب التجميل ذات أتعاب حرة وتقع بالكامل على عاتق المريض. لكونها بلا غاية علاجية، فهي غير متكفَّل بها لا من CNSS ولا من AMO. تتوقف الميزانية على نوع العمل وكمية المنتج المستعملة وعدد الجلسات اللازمة.",
          "لذلك يجب اعتبار هذه العلاجات استثماراً شخصياً والحذر من العروض المغرية جداً، التي كثيراً ما تعني منتجات مشبوهة أو أطباء غير مؤهلين. اطلبوا دائماً عرض أثمان مفصلاً وفضّلوا الجودة والسلامة على الثمن الأدنى.",
        ],
      },
      {
        h: "طب التجميل والحالات الخاصة",
        body: [
          "تفرض بعض الحالات حذراً مشدداً أو تمنع مؤقتاً الأعمال التجميلية. الحقن غير محبذة أثناء الحمل والرضاعة. على المرضى الذين يتناولون مضادات التخثر أو يعانون من أمراض المناعة الذاتية أو عدوى جلدية نشطة إخبار الطبيب، الذي سيكيّف العمل أو يؤجله.",
          "يمكن لطب التجميل أيضاً أن يرافق مساراً علاجياً: علاج الندبات، أو التعرق المفرط (فرط التعرق) بالبوتوكس، أو التكفل باضطرابات جلدية بالتنسيق مع طبيب الجلد. في هذه الحالات، يتجاوز الهدف مجرد الرفاهية التجميلية ويندرج ضمن مقاربة طبية شاملة.",
        ],
      },
      {
        h: "تحضير البشرة جيداً واتّباع التوصيات بعد العمل التجميلي",
        body: [
          "تُحسّن بعض الاحتياطات النتيجة وتقلّل من المضاعفات. قبل العمل يُنصح بتجنّب الكحول والأدوية المميّعة للدم (إلا بمشورة طبية)، والإبلاغ عن أي علاج جارٍ، والحضور ببشرة نظيفة دون مكياج. أما بالنسبة لعلاجات الليزر أو التقشير، فإن التعرّض الحديث للشمس أو اسمرار البشرة يزيد خطر ظهور البقع، لذا غالباً ما تُبرمَج هذه الأعمال خارج فترات الشمس القوية.",
          "بعد العمل، يُعدّ اتّباع تعليمات الطبيب أمراً أساسياً: عدم تدليك المناطق المحقونة، وتجنّب الرياضة العنيفة والحرارة (الحمّام، الساونا) والتعرّض للشمس طوال المدة المحدَّدة، ووضع واقٍ شمسي عالي الحماية. هذه الخطوات البسيطة تحدّ من الكدمات والوذمة والبقع، وتُحسّن ثبات النتيجة. وعند الشعور بألم غير معتاد أو ابيضاض الجلد أو اضطراب في الرؤية، اتصل فوراً بطبيبك أو بالمستعجلات (15، الإسعاف).",
        ],
      },
    ],
    prix: {
      title: "أثمان طب التجميل في المغرب",
      intro: "الأتعاب حرة في القطاع الخاص وتختلف حسب المدينة والطبيب والمنتجات المستعملة وعدد الجلسات. إليكم فئات أثمان إرشادية ملاحَظة في المدن المغربية الكبرى.",
      rows: [
        { label: "استشارة التقييم", value: "300 – 600 درهم" },
        { label: "حقن البوتوكس (منطقة واحدة)", value: "1500 – 3000 درهم" },
        { label: "حقن حمض الهيالورونيك (حقنة واحدة)", value: "2500 – 5000 درهم" },
        { label: "التقشير الكيميائي (جلسة)", value: "600 – 1500 درهم" },
        { label: "الميزوثيرابي أو جلسة ليزر", value: "800 – 2500 درهم" },
      ],
      note: "أثمان إرشادية لسنة 2026، يُنصح بتأكيدها لدى الطبيب. أعمال طب التجميل ليست ذات غاية علاجية وهي غير مُستَرجَعة من طرف CNSS أو AMO.",
    },
  },

  "geriatrie": {
    reviewed: "2026-07-05",
    description:
      "طبيب المسنين هو الطبيب المتخصص في صحة الأشخاص المسنين. في المغرب، حيث يرتفع أمد الحياة ويصبح شيخوخة السكان رهاناً من رهانات الصحة العمومية، يكتسب هذا التخصص مكانة متنامية. لا يعالج طبيب المسنين مرضاً واحداً بل يتكفل بتعدد الأمراض: تعايش عدة أمراض مزمنة لدى المريض نفسه (السكري، ارتفاع الضغط الدموي، خشونة المفاصل، قصور القلب). كما يتمثل دوره في الحفاظ على الاستقلالية، والوقاية من السقوط، والكشف عن اضطرابات الذاكرة وسوء التغذية، وخصوصاً ضبط العلاجات للحد من الآثار الدوائية الضارة، أي المضاعفات المرتبطة بتناول عدد كبير من الأدوية. يظل طب المسنين تخصصاً في طور النمو بالمغرب، يُمارَس في المصالح الاستشفائية العمومية وبعض المؤسسات الخاصة وفي العيادات. عبر SantéauMaroc، يمكنكم تحديد الأطباء المختصين في طب المسنين قربكم وتنظيم تكفل ملائم للشخص المسن.",
    quandConsulter: [
      "السقوط المتكرر أو فقدان التوازن أو الخوف من السقوط لدى شخص مسن",
      "اضطرابات الذاكرة أو التشوش أو تغير غير معتاد في السلوك",
      "فقدان الوزن أو فقدان الشهية أو علامات سوء التغذية",
      "تعدد الأدوية والشك في فائدتها أو في آثارها الجانبية",
      "فقدان تدريجي للاستقلالية في أعمال الحياة اليومية (النظافة، اللباس، المشي)",
    ],
    faqs: [
      { q: "متى يجب استشارة طبيب المسنين؟", a: "من المفيد استشارة طبيب المسنين عندما يعاني شخص مسن من عدة أمراض مزمنة، أو يتناول أدوية كثيرة، أو يتعرض للسقوط، أو يفقد استقلاليته تدريجياً. كما يُنصح بإجراء تقييم شامل للمسنين في حالة اضطرابات الذاكرة أو فقدان الوزن غير المبرر أو قبل اتخاذ قرار طبي مهم." },
      { q: "كم تكلف استشارة طبيب المسنين في المغرب؟", a: "في القطاع الخاص تكون الأتعاب حرة. تتراوح الاستشارة عموماً بين 300 و600 درهم في المدن الكبرى مثل الدار البيضاء والرباط ومراكش، وغالباً بين 250 و450 درهماً في المدن الأخرى. أما التقييم الشامل الأول للمسنين، وهو أطول، فقد يُفوتَر بمبلغ أعلى. في القطاع العمومي الاستشفائي تكون التعريفات أكثر تيسيراً بكثير." },
      { q: "هل استشارة طبيب المسنين مسترجعة من CNSS أو AMO؟", a: "نعم. استشارة طب المسنين هي استشارة طبية تخصصية: يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي محسوب على أساس التعريفة الوطنية المرجعية (TNR)، عموماً حوالي 80% من هذه التعريفة للاستشارة الأساسية. يتوقف الباقي على عاتق المريض على الفارق بين الأتعاب الفعلية والتعريفة المرجعية." },
      { q: "ما الفرق بين طبيب المسنين والطبيب العام؟", a: "يضمن الطبيب العام المتابعة المعتادة وينسق العلاجات. أما طبيب المسنين فمتخصص في التعقيد المرتبط بالسن: يقيّم الشخص المسن بشكل شامل (الصحة، الذاكرة، الاستقلالية، العلاجات، التغذية) ويعيد ضبط التكفل لتفادي الاستشفاء والآثار الدوائية الضارة. وكلاهما يكمل الآخر." },
      { q: "ما هو التقييم الشامل للمسنين؟", a: "هو فحص معمق يستكشف الحالة الطبية والحركة والذاكرة والمزاج والتغذية والاستقلالية وعلاجات الشخص المسن. يسمح هذا التقييم، وهو أطول من الاستشارة العادية، بوضع خطة علاج شخصية ورصد المخاطر مثل السقوط أو سوء التغذية." },
      { q: "كيف يمكن أخذ موعد مع طبيب المسنين في المغرب؟", a: "عبر SantéauMaroc، صفِّ حسب تخصص «طب المسنين» وحسب المدينة لإيجاد طبيب قربكم، قارِن الملفات واحجز عبر الإنترنت مجاناً. كما يمكنكم طلب توجيه من طبيبكم المعالج نحو مصلحة استشفائية لطب المسنين." },
      { q: "هل يمكن لطبيب الشيخوخة التدخل في المنزل لفائدة شخص مسن معتمد على الغير؟", a: "نعم، يقترح بعض أطباء الشيخوخة وفرق الرعاية زيارات منزلية، وهي مفيدة بشكل خاص للأشخاص المسنين محدودي الحركة أو الذين فقدوا استقلاليتهم. تتيح هذه الاستشارة تقييم بيئة العيش الفعلية (مخاطر السقوط، تهيئة السكن، المساعدة البشرية). في المغرب، يبقى هذا العرض متطورا خصوصا في القطاع الخاص بالمدن الكبرى؛ استفسر عند حجز الموعد عن توفر هذه الخدمة." },
      { q: "كيف نساعد قريبا مسنا يرفض استشارة طبيب الشيخوخة؟", a: "رفض العلاج شائع لدى الأشخاص المسنين، غالبا خوفا من فقدان الاستقلالية أو إنكارا للاضطرابات. فضّل مقاربة تدريجية: تحدث عن مجرد فحص صحي بدل استشارة متخصصة، وأشرك طبيب العائلة الذي يثق فيه القريب. إشراك الشخص في القرار، دون إكراهه، يرفع بشكل واضح من فرص القبول." },
      { q: "هل يهتم طبيب الشيخوخة باضطرابات الذاكرة ومرض ألزهايمر؟", a: "نعم، يشكل تقييم الاضطرابات المعرفية صلب مهنة طبيب الشيخوخة، الذي يستعمل اختبارات ملائمة للتمييز بين الشيخوخة الطبيعية ومرض مثل ألزهايمر. ينسق التشخيص مع طبيب الأعصاب عند الحاجة، ويقترح متابعة ويرافق المحيط العائلي. تساعد الرعاية المبكرة على تنظيم الحياة اليومية بشكل أفضل وتأمين المنزل." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "تعريفة الاستشارة" },
      { value: "مقاربة شاملة", label: "تعدد الأمراض والاستقلالية" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الحالات التي يتكفل بها طبيب المسنين",
        body: [
          "يهتم طبيب المسنين بالأمراض الشائعة لدى الشخص المسن: الأمراض المزمنة المصاحبة (السكري، ارتفاع الضغط الدموي، قصور القلب أو الكلى)، الاضطرابات العصبية الإدراكية مثل مرض الزهايمر، اكتئاب المسن، هشاشة العظام والضعف العظمي. وخصوصيته هي معالجة هذه المشاكل مجتمعة لا منفردة.",
          "يشكل السقوط سبباً رئيسياً للاستشارة: فقد يكشف عن تراجع في البصر أو اضطراب في التوازن أو أثر دوائي أو ضعف عضلي. يبحث طبيب المسنين عن السبب، ويقي من التكرار، ويحد من خطر الكسر الذي يُعد مصدراً متكرراً لفقدان الاستقلالية لدى الشخص المسن.",
        ],
      },
      {
        h: "الفحوصات والتقييم الشامل للمسنين",
        body: [
          "تعتمد استشارة طب المسنين أولاً على اختبارات سريرية بسيطة: تقييم الذاكرة والمشي والتوازن والمزاج والحالة التغذوية والاستقلالية في أعمال الحياة اليومية. توجه هذه المقاييس التشخيص دون الحاجة بالضرورة إلى فحوصات ثقيلة.",
          "حسب الحاجة، قد يطلب طبيب المسنين تحليلاً دموياً أو تقييماً تغذوياً أو تصويراً (سكانير أو IRM دماغي في حالة اضطرابات الذاكرة) أو رأي أطباء آخرين. ويبقى الهدف دائماً اقتراح الفحوصات المفيدة فعلاً، دون الإكثار من الاستقصاءات المزعجة لشخص هش.",
        ],
      },
      {
        h: "الوقاية من السقوط وسوء التغذية وفقدان الاستقلالية",
        body: [
          "الوقاية في صلب طب المسنين. تمر الوقاية من السقوط عبر تكييف المنزل، ومراجعة الأدوية التي تُنعِس أو تخفض الضغط، وتصحيح البصر، والحفاظ على نشاط بدني ملائم. هذه الإجراءات البسيطة تقلص بوضوح خطر الكسر.",
          "سوء التغذية شائع وغالباً ما يُستهان به لدى الشخص المسن: فهو يفاقم التعب، ويضعف المناعة، ويسهل السقوط. يراقب طبيب المسنين الوزن، ويكيّف التغذية، ويتدخل مبكراً للحفاظ على القوة العضلية والاستقلالية أطول مدة ممكنة.",
        ],
      },
      {
        h: "ضبط العلاجات ومكافحة الآثار الدوائية الضارة",
        body: [
          "غالباً ما يجمع المسنون عدداً كبيراً من الأدوية الموصوفة من أطباء مختلفين. يزيد هذا التعدد الدوائي من خطر التفاعلات والسقوط والتشوش والاستشفاء: وهي الآثار الدوائية الضارة. يراجع طبيب المسنين مجموع الوصفات لإيقاف ما هو غير مفيد أو خطير.",
          "كما يكيّف الجرعات مع وظيفة الكلى والكبد التي تتغير مع التقدم في السن. تُعد هذه المراجعة المنتظمة للعلاجات من أثمن ما يقدمه طب المسنين: فهي تحسّن راحة الحياة مع تقليل الآثار الجانبية.",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع في المغرب",
        body: [
          "في المغرب، يُمارَس طب المسنين في المصالح الاستشفائية العمومية وبعض العيادات الخاصة وفي العيادات الطبية. غالباً ما يُوجَّه الشخص المسن من طرف طبيبه المعالج، لكن الاستشارة المباشرة تبقى ممكنة. والتنسيق بين طبيب المسنين وطبيب الأسرة والعائلة أمر أساسي.",
          "على الصعيد المالي، يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي للاستشارة، محسوب على أساس التعريفة الوطنية المرجعية. كما يمكن تحمّل الفحوصات والتحاليل الموصوفة جزئياً. ويُنصح بالاحتفاظ بجميع أوراق العلاج لتكوين ملف الاسترجاع.",
        ],
      },
      {
        h: "طبيب الشيخوخة في قلب الأسرة ومرافقة مقدمي الرعاية",
        body: [
          "في المغرب، يعيش الشخص المسن في الغالب داخل الأسرة، وغالبا ما يتولى الزوج أو الأبناء أو الأقارب يوميا المساعدة في الوجبات والنظافة الشخصية وتناول الأدوية. يعترف طبيب الشيخوخة بهذا الدور المحوري لمقدم الرعاية ويدمجه بشكل كامل في الرعاية: فيشرح المرض بعبارات واضحة، ويدرّب على الحركات الصحيحة، ويساعد على استباق تطور الحالة تفاديا لمواقف الأزمة.",
          "تعد مرافقة مقدمي الرعاية أمرا أساسيا لأن العبء قد يصبح مرهقا، جسديا ومعنويا، وهو ما يسمى بإنهاك مقدم الرعاية. يكون طبيب الشيخوخة منتبها لهذه العلامات، ويوجه نحو حلول للاستراحة عند توفرها، وينسق بين المتدخلين حول الشخص. في حالة وضع طبي خطير أو ضائقة حادة (سقوط مصحوب بتوعك، تخليط ذهني مفاجئ، صعوبة في التنفس)، يجب الاتصال دون تأخير بالمصالح الاستعجالية عبر الرقم 15 (المساعدة الطبية الاستعجالية).",
        ],
      },
    ],
    prix: {
      title: "تعريفات طبيب المسنين في المغرب",
      intro: "الأتعاب حرة في القطاع الخاص. إليكم فئات إرشادية لطب المسنين وأكثر الأعمال شيوعاً. تختلف التعريفات حسب المدينة والطبيب ومدة الاستشارة.",
      rows: [
        { label: "الاستشارة (المدن الكبرى)", value: "300 – 600 درهم" },
        { label: "الاستشارة (المدن الأخرى)", value: "250 – 450 درهم" },
        { label: "التقييم الشامل للمسنين", value: "500 – 900 درهم" },
        { label: "استشارة الذاكرة / الاضطرابات الإدراكية", value: "400 – 700 درهم" },
        { label: "الاستشارة في القطاع العمومي الاستشفائي", value: "تعريفات مخفضة" },
      ],
      note: "فئات إرشادية لسنة 2026، للمعلومة فقط وغير تعاقدية. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي على أساس التعريفة الوطنية المرجعية (TNR).",
    },
  },

  "neurochirurgie": {
    reviewed: "2026-07-05",
    description:
      "جراحة الأعصاب هي التخصص الجراحي الذي يُعنى بأمراض الجهاز العصبي: الدماغ والنخاع الشوكي والأعصاب المحيطية والعمود الفقري. في المغرب، يتدخل جراح الأعصاب في الغالب بناءً على توجيه من طبيب الأعصاب أو الطبيب المعالج أو بعد المرور عبر المستعجلات، من أجل أمراض مثل الانزلاق الغضروفي وتضيق القناة القطنية والأورام الدماغية والرضوض القحفية. ولا ينبغي الخلط بينه وبين طبيب الأعصاب الذي يعالج الأمراض العصبية بالطرق الطبية دون إجراء عملية. يمارس جراحو الأعصاب مهنتهم في المستشفيات الجامعية والعمومية بالمدن الكبرى (الدار البيضاء، الرباط، مراكش، فاس) وكذلك في العيادات الخاصة. في القطاع الخاص، تكون الأتعاب حرة وتختلف حسب المدينة وتعقيد العملية. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لتكلفة الاستشارة ومن تحمل جزئي للأعمال الجراحية في إطار التعريفة الوطنية المرجعية. عبر SantéauMaroc، يمكنك العثور على جراح أعصاب قريب منك وحجز موعد عبر الإنترنت مجانًا.",
    quandConsulter: [
      "آلام مستمرة في الظهر أو الرقبة تمتد إلى الذراع أو الساق، رغم علاج طبي جيد التطبيق",
      "عرق النسا أو انزلاق غضروفي مؤكد بالتصوير بالرنين المغناطيسي (IRM) لا يستجيب للراحة والأدوية وإعادة التأهيل",
      "اضطرابات في المشي أو ضعف في العضلات أو فقدان الإحساس في أحد الأطراف يظهر بشكل تدريجي",
      "صداع غير معتاد ومتواصل مصحوب بالقيء أو اضطرابات في الرؤية أو تشنجات",
      "بعد رضّ قحفي أو فقري، أو بعد اكتشاف ورم في الدماغ أو النخاع عبر التصوير",
    ],
    faqs: [
      { q: "ما الفرق بين جراح الأعصاب وطبيب الأعصاب؟", a: "طبيب الأعصاب هو طبيب يُشخّص ويعالج أمراض الجهاز العصبي بالوسائل الطبية (الأدوية والمتابعة) دون إجراء عملية. أما جراح الأعصاب فهو جرّاح يتدخل في غرفة العمليات على الدماغ أو النخاع أو الأعصاب أو العمود الفقري. وغالبًا ما يعملان معًا: يوجّه طبيب الأعصاب المريض إلى جراح الأعصاب عندما تصبح العملية واردة." },
      { q: "كم تكلفة استشارة جراحة الأعصاب في المغرب؟", a: "في القطاع الخاص تكون الأتعاب حرة. تتراوح الاستشارة عادةً بين 400 و700 درهم في المدن الكبرى مثل الدار البيضاء والرباط ومراكش، وبين 300 و500 درهم في المدن الأخرى. تختلف أسعار العمليات الجراحية بشكل كبير حسب نوعها والمؤسسة. أما في القطاع العمومي فتكون الاستشارة أقل تكلفة بكثير." },
      { q: "كيف أحجز موعدًا مع جراح أعصاب في المغرب؟", a: "عبر SantéauMaroc، صفِّ الدليل حسب تخصص «جراحة الأعصاب» وحسب المدينة لعرض الأطباء القريبين منك. يمكنك الاطلاع على ملفهم ولغاتهم وعنوانهم، ثم حجز موعد عبر الإنترنت مجانًا عندما يتيح الطبيب الحجز. احرص على إحضار صور الرنين المغناطيسي والسكانير ورسالة طبيبك يوم الاستشارة." },
      { q: "هل يلزم توجيه لاستشارة جراح أعصاب؟", a: "ليس إلزاميًا، لكنه المسار الأكثر شيوعًا وفعالية. يصل أغلب المرضى بتوجيه من طبيب الأعصاب أو الطبيب العام أو بعد المرور عبر المستعجلات، مصحوبًا بفحوصات التصوير. وهذا يمكّن جراح الأعصاب من تقييم دواعي العملية منذ البداية وتفادي فحوصات مكررة." },
      { q: "هل جراحة الانزلاق الغضروفي ضرورية دائمًا؟", a: "لا. تتحسن أغلب حالات الانزلاق الغضروفي بالعلاج الطبي والراحة النسبية والعلاج الطبيعي. تُخصَّص الجراحة للحالات التي يقاوم فيها الألم العلاج، أو عند وجود علامات خطورة مثل الشلل أو اضطرابات التبول. يقيّم جراح الأعصاب معك نسبة الفائدة إلى المخاطر قبل أي قرار." },
      { q: "هل تُسترجع تكاليف جراحة الأعصاب من CNSS أو AMO؟", a: "نعم، جزئيًا. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لتكلفة الاستشارة، يُحتسب على أساس التعريفة الوطنية المرجعية. أما العمليات والاستشفاء فتحظى بتحمّل جزئي قد يستلزم اتفاقًا مسبقًا. يُنصح بالتحقق من الشروط لدى هيئتك قبل أي عملية مبرمجة." },
      { q: "ما هي مدة التعافي بعد عملية جراحة الأعصاب؟", a: "تعتمد كثيرًا على نوع التدخل والحالة الصحية الأولية. بعد جراحة الانزلاق الغضروفي، غالبًا ما تُستأنف الأنشطة الخفيفة خلال بضعة أسابيع، بينما تتطلب جراحة الدماغ فترة نقاهة أطول وتحت المراقبة. يحدد جرّاح الأعصاب جدولًا زمنيًا شخصيًا ويصف في الغالب برنامج إعادة تأهيل. تسمح المتابعة المنتظمة بتكييف العودة إلى العمل والجهد البدني." },
      { q: "هل إعادة التأهيل ضرورية بعد جراحة العمود الفقري أو الدماغ؟", a: "نعم، غالبًا ما يُنصح بها لاستعادة الحركة والقوة والاستقلالية. حسب الحالات، تجمع بين العلاج الحركي والعلاج الوظيفي أو إعادة التأهيل العصبي، بتنسيق مع جرّاح الأعصاب وأحيانًا طبيب إعادة التأهيل الوظيفي. في المغرب، تتوفر هذه العلاجات في القطاعين العام والخاص، مع إمكانية تحمّل جزئي عبر CNSS/AMO بناءً على وصفة طبية. البدء المبكر يحسّن النتائج عمومًا." },
      { q: "ما هي العلامات التي تستدعي استشارة طارئة بعد العملية؟", a: "بعد التدخل، تفرض الحمى المرتفعة أو خروج إفرازات أو احمرار على مستوى الجرح، أو صداع شديد، أو تقيؤ، أو ضعف في أحد الأطراف، أو اضطرابات الوعي استشارة فورية. قد تدل هذه العلامات على عدوى أو مضاعفة. في حال ظهور علامة خطيرة أو مفاجئة، اتصل بالرقم 15 (SAMU) دون انتظار. احتفظ دائمًا بوسيلة الاتصال بالفريق الذي أجرى العملية." },
    ],
    essentiel: [
      { value: "400 – 700 درهم", label: "استشارة في مدينة كبرى" },
      { value: "الدماغ · النخاع · العمود", label: "جراحة الجهاز العصبي" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "أبرز الأمراض التي يتم علاجها",
        body: [
          "يتكفّل جراح الأعصاب بطيف واسع من الأمراض. أكثرها شيوعًا يهمّ العمود الفقري: الانزلاق الغضروفي القطني أو الرقبي، وتضيق القناة القطنية المسبب لآلام أثناء المشي، وانضغاط النخاع أو الجذور العصبية. وهذه الأمراض التنكسية شائعة في المغرب، خصوصًا لدى البالغين الذين يزاولون عملًا بدنيًا.",
          "يمتد مجال التدخل أيضًا إلى أورام الدماغ والنخاع، والرضوض القحفية والفقرية، واستسقاء الدماغ، وكذلك بعض الأمراض الوعائية مثل تمدد الأوعية الدموية. يقرر جراح الأعصاب، حسب الحصيلة، بين المراقبة أو العلاج الطبي بتنسيق مع طبيب الأعصاب أو التدخل الجراحي.",
        ],
      },
      {
        h: "الفحوصات والأعمال الشائعة",
        body: [
          "يعتمد التشخيص في جراحة الأعصاب بشكل كبير على التصوير. التصوير بالرنين المغناطيسي (IRM) هو الفحص المرجعي لرؤية الدماغ والنخاع والأقراص الفقرية؛ ويُفضَّل السكانير (TDM) في الحالات المستعجلة، خاصة بعد رضّ قحفي. وقد تُطلب فحوصات تكميلية مثل تخطيط العضلات الكهربائي أو تصوير الأوعية حسب الحالة.",
          "أما بخصوص الأعمال، فيجري جراح الأعصاب علاج الانزلاق الغضروفي، واستئصال الصفيحة الفقرية لتضيق القناة، واستئصال الأورام، ووضع تحويلة لاستسقاء الدماغ، أو جراحة الأعصاب المحيطية مثل النفق الرسغي. وتستفيد كثير من العمليات اليوم من التقنيات قليلة التوغل والجراحة المجهرية، المتوفرة في المراكز المجهّزة بالمدن الكبرى.",
        ],
      },
      {
        h: "الوقاية والتكفّل بآلام الظهر",
        body: [
          "أغلب آلام الظهر والرقبة لا تستدعي الجراحة. تمرّ الوقاية عبر وضعية جيدة للجسم، وتقوية العضلات، والتحكم في الوزن، وتكييف الحركات مع طبيعة العمل. وعند وجود ألم، يجمع الخط الأول من العلاج بين المسكنات والراحة النسبية والعلاج الطبيعي، وهو كافٍ في الغالب.",
          "يأتي اللجوء إلى جراح الأعصاب عندما تستمر الأعراض رغم هذا العلاج، أو عند وجود علامات إنذار: ضعف حركي، أو اضطرابات في المصرّات، أو ألم ليلي شديد. الاستشارة في الوقت المناسب تتيح تفادي الجراحة غير الضرورية كما تتيح تجنّب التأخر أمام انضغاط عصبي يستوجب تدخلًا سريعًا.",
        ],
      },
      {
        h: "مسار العلاج والاسترجاع",
        body: [
          "يبدأ المسار عادةً عند الطبيب المعالج أو طبيب الأعصاب، الذي يصف التصوير ويوجّه نحو جراح الأعصاب إذا كانت العملية واردة. وفي حالة رضّ خطير أو أعراض مفاجئة، يتم التكفل عبر المستعجلات. وللمريض الخيار بين القطاع العمومي، حيث الأسعار منخفضة لكن المواعيد أحيانًا طويلة، والقطاع الخاص.",
          "يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي لتكلفة الاستشارة، على أساس التعريفة الوطنية المرجعية، ومن تحمّل جزئي للأعمال الجراحية والاستشفاء. وكثيرًا ما يلزم طلب اتفاق مسبق للعمليات المبرمجة: من الحكمة تجهيز الملف مع المؤسسة مسبقًا.",
        ],
      },
      {
        h: "المستعجلات والحالات الخاصة",
        body: [
          "بعض الحالات تستوجب تكفلًا فوريًا. رضّ قحفي مصحوب بفقدان الوعي أو القيء أو التشوّش، أو شلل مفاجئ في أحد الأطراف، أو فقدان التحكم في البول أو البراز مصحوبًا بألم في الظهر، أو صداع عنيف غير معتاد، كلها حالات توجب التوجه إلى المستعجلات دون تأخير. وعند وجود خطر، اتصل بالرقم 15 (SAMU).",
          "لدى الطفل، تتكفل جراحة الأعصاب بأمراض خاصة مثل استسقاء الدماغ أو بعض التشوهات، في مراكز متخصصة. ولدى المسنّ، يكثر تضيق القناة القطنية والأورام الدموية بعد السقوط. وفي جميع الحالات، يأخذ قرار العملية في الاعتبار الحالة العامة وتطلعات المريض.",
        ],
      },
      {
        h: "الاختيار بين القطاع العام والخاص لإجراء عملية جراحية",
        body: [
          "في المغرب، تُمارس جراحة الأعصاب في المستشفيات العمومية الكبرى والمراكز الاستشفائية الجامعية (خاصة الدار البيضاء والرباط وفاس ومراكش)، وكذلك في العيادات الخاصة. يوفر القطاع العام منصة تقنية متكاملة للحالات الثقيلة وتكلفة أقل بكثير، لكن آجال التدخل المبرمج قد تكون أطول. أما القطاع الخاص فيتيح غالبًا آجالًا أقصر، مقابل أتعاب حرة تتفاوت بشكل كبير حسب نوع العملية والمؤسسة.",
          "يعتمد الاختيار على درجة الاستعجال وطبيعة المرض وتغطيتك الصحية. قبل تدخل مبرمج، اطلب فاتورة تقديرية مفصلة في القطاع الخاص وتحقق لدى CNSS أو AMO من شروط التحمّل والاتفاق المسبق. بالنسبة للحالات المستعجلة أو المعقدة، يظل التوجيه إلى مركز استشفائي جامعي غالبًا الخيار الأنسب. تساعدك SantéauMaroc على تحديد جرّاحي الأعصاب والمؤسسات القريبة منك.",
        ],
      },
    ],
    prix: {
      title: "أسعار إرشادية في جراحة الأعصاب بالمغرب",
      intro: "في القطاع الخاص، تكون الأتعاب حرة وتعتمد على المدينة وخبرة الطبيب وتعقيد العملية. إليك فئات إرشادية لمساعدتك على توقّع الميزانية.",
      rows: [
        { label: "استشارة (المدن الكبرى: الدار البيضاء، الرباط، مراكش)", value: "400 – 700 درهم" },
        { label: "استشارة (المدن الأخرى)", value: "300 – 500 درهم" },
        { label: "تصوير بالرنين المغناطيسي للدماغ أو العمود (IRM)", value: "1500 – 3500 درهم" },
        { label: "علاج الانزلاق الغضروفي (خاص، حسب التقنية)", value: "20000 – 45000 درهم" },
        { label: "جراحة ورم أو القناة القطنية (خاص)", value: "ابتداءً من 30000 درهم" },
      ],
      note: "أسعار إرشادية لسنة 2026، للتوجيه فقط وغير تعاقدية. تختلف الأسعار الفعلية حسب الطبيب والمؤسسة. يستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي على أساس التعريفة الوطنية المرجعية؛ وكثيرًا ما يلزم طلب اتفاق مسبق للعمليات المبرمجة.",
    },
  },

  "medecine-generale": {
    reviewed: "2026-07-04",
    description:
      "الطبيب العام — ويُسمّى أيضًا طبيب الأسرة أو الطبيب الممارس العام — هو المُحاوِر الأول في مسار علاجك بالمغرب. وهو متاح دون إحالة مسبقة، يشخّص ويعالج الغالبية العظمى من الأمراض الشائعة (العدوى، الحمى، الآلام، الاضطرابات الهضمية) ويتابع الأمراض المزمنة كالسكري وارتفاع ضغط الدم والربو. وباعتباره محور المنظومة الصحية، ينسّق تكفّلك، ويتابع ملفك الطبي، ويوجّهك إلى الأخصائي المناسب عند الحاجة. ويشمل الطب العام كذلك الوقاية (التلقيحات، الفحوص الصحية، الكشف المبكر) وتسليم الشهادات الطبية وتجديد الوصفات. وتتيح استشارة طبيب عام بانتظام الكشف المبكر عن الأمراض وتفادي مضاعفات أثقل.",
    quandConsulter: [
      "حمى مستمرة، إنفلونزا، التهاب الحلق أو عدوى أنفية أذنية حنجرية",
      "آلام في البطن، صداع أو آلام عضلية",
      "تعب غير معتاد، اضطرابات النوم أو قلق خفيف",
      "متابعة الأمراض المزمنة: السكري، ارتفاع ضغط الدم، الربو",
      "تجديد وصفة طبية وتعديل العلاج",
      "تلقيح، فحص صحي سنوي أو كشف مبكر",
      "شهادة طبية (رياضة، عمل، دراسة، أهلية)",
      "تفسير نتائج التحاليل أو التصوير الطبي",
    ],
    faqs: [
      { q: "ما هو دور الطبيب العام؟", a: "الطبيب العام هو طبيب الخط الأول: يتكفّل بالغالبية العظمى من أسباب الاستشارة الشائعة (العدوى، الآلام، الحمى، التعب)، ويتابع الأمراض المزمنة، ويتكفّل بالوقاية والتلقيحات، وينسّق مجمل مسار علاجك. ولا يوجّهك إلى الأخصائي المناسب إلا عندما تستدعي حالتك ذلك." },
      { q: "ما الفرق بين الطبيب العام وطبيب الأسرة؟", a: "الأمر يتعلّق بالتخصص نفسه: « طبيب الأسرة » يشير إلى ممارسة الطب العام المرتكزة على المتابعة الدائمة للمريض ومحيطه، عبر ملف طبي يُحفظ عبر الزمن. وبالمغرب تُستعمل عبارات الطبيب العام وطبيب الأسرة والممارس العام بشكل مترادف." },
      { q: "كم تكلّف استشارة في الطب العام بالمغرب؟", a: "الأتعاب حرّة في القطاع الخاص: احسب عمومًا ما بين 150 و300 درهم في المدن الكبرى (الدار البيضاء، الرباط، مراكش) وابتداءً من 100 درهم في المدن المتوسطة والمناطق القروية. وتترتّب زيادة على الزيارة المنزلية أو استشارة الليل/الأحد. ويُسترجَع للمؤمَّنين لدى CNSS أو AMO على أساس التعريفة الوطنية المرجعية (TNR)." },
      { q: "كيف تُسترجَع مصاريف استشارة الطبيب العام (CNSS، AMO)؟", a: "يسترجع التأمين الإجباري عن المرض (AMO) المُدار من طرف CNSS استشارة الطب العام بنسبة تقارب 80 % من التعريفة الوطنية المرجعية (TNR)، مع تحمّلك لحصّة تعديلية بنسبة 20 %. مثلًا، على أساس TNR قدره 150 درهمًا، يُسترجَع نحو 120 درهمًا. ويلزم إيداع ورقة علاجات مملوءة وممهورة من الطبيب (التصريح ممكن عبر cnss.ma) داخل أجل 6 أشهر. ويمكن لتعاضدية تكميلية تغطية الباقي." },
      { q: "هل تلزم وصفة أو إحالة لاستشارة طبيب عام؟", a: "لا. الطبيب العام متاح بولوج مباشر، دون وصفة ولا إحالة مسبقة من مهني صحي آخر. ويمكن أن يكون أول اتصال لك بشأن مشكل شائع، بما في ذلك حالة طارئة غير حيوية." },
      { q: "هل يمكن للطبيب العام تسليم شهادة طبية؟", a: "نعم. يُسلّم الطبيب العام أغلب الشهادات الطبية الشائعة: شهادة الأهلية لممارسة الرياضة، شهادة عدم وجود مانع، الإعفاء من العمل، الغياب المدرسي أو شهادة الأهلية المهنية. ولا تُسلّم الشهادة إلا بعد فحص سريري يبرّرها." },
      { q: "كيف أجد طبيبًا عامًّا مناوبًا أو يوم الأحد بالمغرب؟", a: "للحاجة مساءً أو في عطلة نهاية الأسبوع أو يوم عطلة، يمكنك استشارة طبيب مناوب أو مركز حراسة صحية أو مصلحة مستعجلات. وعلى صحة بالمغرب، صفِّ حسب التوفّر لتحديد الأطباء المتاحين اليوم. وفي حالة الطوارئ الحيوية، اتصل بالإسعاف (15) أو (150)." },
      { q: "هل يمكن استشارة طبيب عام في المنزل أو عن بُعد؟", a: "نعم. يقترح بعض الأطباء العامّين الزيارة المنزلية (مفيدة للمسنّين أو محدودي الحركة) وكذلك الاستشارة عن بُعد، المناسبة للحصول على رأي طبي أو تجديد وصفة أو تفسير نتائج. ولا تعوّض الاستشارة عن بُعد الفحص السريري عند الحاجة إليه." },
      { q: "كيف أحجز موعدًا مع طبيب عام بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الطب العام » ومدينتك، وقارن الملفات الموثوقة وآراء المرضى واللغات المتحدَّث بها والتعاقد، ثم احجز عبر الإنترنت مجانًا — دون رسوم تسجيل ومع تأكيد الموعد." },
    ],
    essentiel: [
      { value: "100 – 300 درهم", label: "ثمن الاستشارة" },
      { value: "≈ 80 % من TNR", label: "استرجاع CNSS / AMO" },
      { value: "ولوج مباشر", label: "الخط الأول، دون إحالة" },
    ],
    sections: [
      {
        h: "الطبيب العام أم الأخصائي: من تستشير أولًا؟",
        body: [
          "بالمغرب، يُعدّ الطبيب العام مدخلك الطبيعي إلى منظومة العلاج. يتكفّل بالغالبية العظمى من أسباب الاستشارة — الحمى، العدوى، الآلام، التعب، الاضطرابات الهضمية — دون الحاجة إلى أي إحالة مسبقة.",
          "يبقى اللجوء المباشر إلى أخصائي (طبيب قلب، طبيب جلد، طبيب أمراض النساء…) ممكنًا، لكن من الأنجع غالبًا استشارة طبيب عام أولًا: فهو يضع تشخيصًا أوليًا، ويصف الفحوص المفيدة، ويوجّهك إلى الأخصائي المناسب عند الحاجة. وهذا التنسيق يتفادى استشارات غير ضرورية ويسرّع تكفّلك.",
        ],
      },
      {
        h: "الطب العام أم طب الأسرة: ما الفرق؟",
        body: [
          "تشير التسميتان إلى التخصص نفسه. و« طب الأسرة » يشدّد على علاقة المتابعة عبر الزمن: الطبيب نفسه يعرف سوابقك وسوابق أسرتك ويمسك ملفًّا طبيًّا يشكّل ذاكرة صحتك. والإنصات والتوفّر والنصائح الشخصية هي مفاتيحه.",
          "وبالمغرب تُستعمل عبارات الطبيب العام وطبيب الأسرة والممارس العام بشكل مترادف. والأهمّ ليس التسمية بل الاستمرارية: استشارة الطبيب نفسه بانتظام تحسّن جودة المتابعة والتحكّم في نفقات الصحة.",
        ],
      },
      {
        h: "كيف تجري استشارة الطب العام؟",
        body: [
          "تبدأ الاستشارة باستجواب (سبب الزيارة، الأعراض، السوابق، العلاجات الجارية)، يليه فحص سريري. ثم يمكن للطبيب أن يصف تحاليل أو تصويرًا أو علاجًا، ويحرّر وصفة، ويسلّم شهادة، أو يوجّهك إلى أخصائي.",
          "لربح الوقت، أحضر بطاقتك الوطنية، بطاقة تأمينك (CNSS/AMO أو تعاضدية)، وصفاتك وعلاجاتك الجارية، دفتر التلقيح وكذلك آخر نتائج تحاليلك أو صورك الطبية. ودوّن مسبقًا أسئلتك وتسلسل أعراضك.",
        ],
      },
      {
        h: "استرجاع مصاريف الاستشارة: CNSS وAMO والتعاضديات",
        body: [
          "يُسترجَع للمؤمَّنين لدى AMO (المُدار من طرف CNSS) على أساس التعريفة الوطنية المرجعية (TNR) المحدَّدة من طرف ANAM، عمومًا بنسبة 80 %، مع تحمّلهم حصّة تعديلية بنسبة 20 %. ويرتكز الاسترجاع على التعريفة المرجعية، التي غالبًا ما تكون أدنى من الأتعاب المطبَّقة فعليًّا في القطاع الخاص.",
          "للاستفادة من الاسترجاع، أودِع ورقة علاجات مملوءة وموقَّعة وممهورة من الطبيب، مرفقة بالوصفة والإثباتات. وتتيح CNSS الآن التصريح عن بُعد عبر الإنترنت بآجال مختصرة. ويجب إيداع الملف داخل أجل 6 أشهر من الاستشارة؛ ويمكن لتعاضدية تكميلية تغطية الباقي.",
        ],
      },
      {
        h: "الطبيب العام أم المناوب أم المستعجلات: كيف تختار؟",
        body: [
          "بالنسبة لمشكل صحي شائع وغير حيوي — حمى، التهاب الحلق، تجديد وصفة، شهادة طبية، ألم معتدل — يبقى الطبيب العام هو المحاور المناسب، حتى كخيار أول. ومساءً أو في عطلة نهاية الأسبوع أو يوم عطلة، توجّه إلى طبيب مناوب أو مركز حراسة صحية.",
          "في المقابل، تفرض بعض العلامات لجوءًا فوريًا إلى المستعجلات أو الاتصال بالإسعاف (15): ألم حاد في الصدر، صعوبة في التنفس، فقدان الوعي، شلل أو اضطراب مفاجئ في النطق، نزيف غزير، أو أي خطر يهدّد الحياة. وعند الشك في الخطورة، لا تنتظر: اتصل بالنجدة.",
        ],
      },
      {
        h: "الاستشارة عن بُعد مع طبيب عام بالمغرب",
        body: [
          "تتطوّر الاستشارة عن بُعد بسرعة بالمغرب وتتيح التواصل عن بُعد مع طبيب عام للحصول على رأي طبي أو تجديد وصفة أو تفسير نتائج التحاليل.",
          "وهي لا تعوّض الفحص السريري عند الحاجة إليه، لكنها توفّر الوقت في الحالات البسيطة وتسهّل الولوج إلى العلاج في المناطق ذات العرض الطبي المحدود.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب عام؟",
      intro:
        "الأتعاب حرّة في القطاع الخاص بالمغرب وتختلف حسب المدينة والقطاع (عام أو خاص) ونوع الاستشارة. وفيما يلي فئات أسعار إرشادية مُلاحَظة سنة 2026.",
      rows: [
        { label: "المدن الكبرى (الدار البيضاء، الرباط، مراكش)", value: "150 – 300 درهم" },
        { label: "المدن المتوسطة (فاس، طنجة، أكادير، مكناس)", value: "120 – 200 درهم" },
        { label: "المدن الأخرى والمناطق القروية", value: "100 – 150 درهم" },
        { label: "زيارة منزلية", value: "300 – 600 درهم" },
        { label: "ليلًا أو يوم الأحد أو يوم عطلة", value: "زيادة بنسبة 30 – 50 %" },
        { label: "استشارة عن بُعد", value: "100 – 200 درهم" },
      ],
      note: "أسعار إرشادية (2026)، أتعاب حرّة في القطاع الخاص. تسترجع CNSS/AMO على أساس التعريفة الوطنية المرجعية (TNR)، عمومًا بنسبة 80 % (حصّة تعديلية بنسبة 20 % على عاتقك). مثلًا: على أساس TNR قدره 150 درهمًا، يُسترجَع نحو 120 درهمًا.",
    },
  },
  "cardiologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب القلب هو الطبيب المختص في القلب والأوعية الدموية. يشخّص ويعالج أمراض القلب والشرايين: قصور القلب، اضطرابات النظم، ارتفاع ضغط الدم، مرض الشرايين التاجية وأمراض الأوعية المحيطية. وبالمغرب، تمثّل أمراض القلب والشرايين السبب الأول للوفيات، مما يجعل الاستشارة لدى طبيب القلب ضرورية فور ظهور أعراض موحية. ويُجري طبيب القلب فحوصًا متخصصة — تخطيط القلب، تخطيط صدى القلب، اختبار الجهد، هولتر — لوضع تشخيص دقيق واقتراح علاج دوائي أو تدخّلي مناسب.",
    quandConsulter: [
      "ألم في الصدر أو شعور بالضغط في الصدر",
      "خفقان أو نظم قلب غير منتظم",
      "ضيق في التنفس عند الجهد أو في الراحة",
      "ارتفاع ضغط الدم الواجب مراقبته",
      "سوابق عائلية لأمراض القلب والشرايين",
    ],
    faqs: [
      { q: "ما الفحوص التي يُجريها طبيب القلب؟", a: "يُجري طبيب القلب تخطيطًا للقلب، وتخطيط صدى القلب (إيكو)، واختبار جهد، وهولتر تخطيط القلب على مدى 24 ساعة، ويمكن أن يصف سكانير الشرايين التاجية أو تصوير الشرايين حسب الحالة السريرية." },
      { q: "كم تكلّف استشارة لدى طبيب القلب بالمغرب؟", a: "يتراوح سعر استشارة القلب بين 300 و600 درهم بالمغرب حسب المدينة والفحوص المشمولة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "هل تلزم إحالة لاستشارة طبيب القلب؟", a: "وصفة الطبيب العام ليست إلزامية لكنها مستحسنة لتوجيه الاستشارة. وتشترط بعض التعاضديات مسارًا منسّقًا للاسترجاع." },
      { q: "كيف أحجز موعدًا مع طبيب القلب بالمغرب؟", a: "تتيح لك صحة بالمغرب إيجاد طبيب قلب متاح في مدينتك، والاطّلاع على آراء المرضى الموثوقة، وحجز موعد عبر الإنترنت مجانًا، دون مدة انتظار إضافية." },
      { q: "متى يجب استشارة طبيب القلب بدل الطبيب العام؟", a: "يبقى الطبيب العام أول من تلجأ إليه، ويمكنه ضمان متابعة أساسية للضغط الدموي أو الكوليسترول. تصبح استشارة طبيب القلب ضرورية عند ظهور أعراض موحية (ألم في الصدر، خفقان، ضيق تنفس غير معتاد، إغماء)، أو وجود سوابق عائلية لمرض قلبي مبكر، أو لإجراء فحص قبل ممارسة رياضة مكثفة. في حال ألم صدري حاد ومستمر، لا تنتظر: اتصل بالرقم 15 (SAMU)." },
      { q: "هل متابعة الحمل عند طبيب القلب ضرورية؟", a: "نعم في بعض الحالات. المرأة الحامل التي تعاني من ارتفاع الضغط، أو مرض قلبي معروف، أو نفخة قلبية، أو خفقان، غالبا ما تُوجَّه إلى طبيب القلب بتنسيق مع طبيب النساء. يعمل القلب بجهد أكبر خلال الحمل، ما قد يكشف أو يفاقم مشكلة سابقة. تتيح المتابعة المشتركة تكييف العلاج وتأمين الولادة." },
      { q: "كيف أستعد لأول استشارة عند طبيب القلب؟", a: "أحضر وصفاتك الطبية الحالية، ونتائج تحاليلك الأخيرة (تحليل الدهون، السكري)، وأي فحص سابق (ECG، صدى القلب، تقارير الاستشفاء). دوّن أعراضك وتواترها والحالات التي تثيرها. جهّز أيضا السوابق القلبية لأفراد عائلتك. تساعد هذه المعلومات طبيب القلب على توجيه تشخيصه منذ الزيارة الأولى." },
      { q: "هل يعوّض AMO وCNSS الفحوصات القلبية في المغرب؟", a: "فحوصات مثل ECG وصدى القلب واختبار الجهد تُغطى مبدئيا من طرف AMO (CNSS للأجراء، نظام المستقلين) على أساس التعريفات المرجعية لـ ANAM. يتم التعويض بعد موافقة مسبقة في بعض الحالات وعند تقديم وصفة طبية. وبما أن أتعاب القطاع الخاص حرة، يبقى غالبا جزء على عاتق المريض: اطلب تسعيرة وفاتورة مطابقة لملف التعويض." },
      { q: "ما تغييرات نمط الحياة التي يوصي بها طبيب القلب أولا؟", a: "أنجع الإجراءات هي الإقلاع عن التدخين، تقليل الملح والدهون المشبعة، ممارسة نشاط بدني منتظم يناسب حالتك، والحفاظ على وزن صحي. يشدد طبيب القلب غالبا على التحكم في التوتر والنوم الكافي. هذه العادات، مقرونة بالعلاج الموصوف، تقلل بوضوح من خطر الحادث القلبي وتُنصح في كل الأعمار." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "ECG · إيكو", label: "فحوص تُجرى بالعيادة" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "لماذا تُعدّ متابعة القلب أساسية بالمغرب؟",
        body: [
          "أمراض القلب والشرايين هي السبب الأول للوفيات بالمغرب، يشجّعها ارتفاع ضغط الدم والسكري والتدخين وزيادة الوزن. ويتطوّر كثير منها بصمت قبل أن يتجلّى بحادث خطير.",
          "وتتيح متابعة منتظمة لدى طبيب القلب، خاصة بعد سن 40 أو عند وجود عوامل خطر، الكشف المبكر والوقاية من الجلطة والسكتة الدماغية. وهي من أكثر المتابعات جدوى من حيث الصحة.",
        ],
      },
      {
        h: "فحوص طبيب القلب: ECG، إيكو، اختبار الجهد",
        body: [
          "يملك طبيب القلب فحوصًا غير باضعة لاستكشاف القلب: تخطيط القلب (ECG) يسجّل النشاط الكهربائي، وتخطيط صدى القلب (الإيكو) يُظهر العضلة والصمامات، واختبار الجهد يختبر القلب عند المجهود.",
          "ويسجّل الهولتر النظم على مدى 24 ساعة لرصد الاضطرابات المتقطّعة. وتُجرى هذه الفحوص غالبًا بالعيادة وتوجّه تشخيصًا دقيقًا والعلاج المناسب.",
        ],
      },
      {
        h: "ارتفاع ضغط الدم: المرض الصامت",
        body: [
          "غالبًا ما لا يسبّب ارتفاع ضغط الدم أي عرض، لكنه يُتلف القلب والشرايين والكلى والدماغ. وهو شائع جدًّا بالمغرب، ويبقى ناقص التشخيص وغير معالَج بما يكفي.",
          "ويتيح كشف بسيط (قياس الضغط) ومتابعة منتظمة التحكّم فيه بنمط الحياة، وعند الحاجة بعلاج. وبضبطه جيدًا، ينخفض خطر السكتة والجلطة بقوة.",
        ],
      },
      {
        h: "التعرّف على طارئ قلبي",
        body: [
          "ألم شديد في الصدر، يضغط كالمِعصرة ويمتدّ نحو الذراع أو الفكّ، خاصة مع ضيق تنفّس أو تعرّق، قد يدلّ على جلطة قلبية. وكل دقيقة مهمّة.",
          "في هذه الحالة، لا تنتظر: اتصل بالإسعاف (15) فورًا. فالتكفّل السريع ينقذ عضلة القلب والحياة.",
        ],
      },
      {
        h: "عوامل الخطر القلبية الوعائية: التحرك مبكرا في المغرب",
        body: [
          "ترفع عدة عوامل من خطر أمراض القلب وتُصادَف كثيرا في المغرب: التدخين، السكري، ارتفاع الكوليسترول، زيادة الوزن، قلة الحركة، والسوابق العائلية. يساهم التحول الغذائي، مع استهلاك متزايد للملح والسكر والمنتجات المصنعة، في هذا التطور، بينما يبقى السكري وارتفاع الضغط من أكثر أسباب الاستشارة شيوعا. يتيح رصد هذه العوامل في أبكر وقت ممكن التحرك قبل ظهور المضاعفات.",
          "لا يقتصر دور طبيب القلب على علاج مرض معلن: بل يقيّم خطرك الإجمالي ويقترح استراتيجية وقاية مخصصة. يمر ذلك عبر فحص (الضغط، تحليل الدهون، السكري، وأحيانا ECG)، ونصائح حول نمط العيش، وعند الحاجة علاج. تكون المتابعة المنتظمة، حتى في غياب الأعراض، مفيدة بشكل خاص بعد سن 40 أو عند وجود عدة عوامل خطر متراكمة.",
        ],
      },
      {
        h: "التعايش مع مرض قلبي: المتابعة والالتزام بالعلاج",
        body: [
          "لا يمنع التشخيص القلبي من عيش حياة نشيطة، شرط المتابعة المنتظمة والالتزام الجيد بالعلاج. تتيح مواعيد المراقبة تعديل الأدوية، ومراقبة الضغط، وإعادة الفحوصات الضرورية (صدى القلب، تحليل الدم). إن إيقاف العلاج دون رأي طبي، حتى عند الشعور بالتحسن، يعرّض للانتكاس ولمضاعفات خطيرة. احتفظ بلائحة محدّثة لأدويتك وأبلغ عن أي أثر جانبي.",
          "يشكّل تثقيف المريض ركيزة للمتابعة القلبية. إن تعلّم التعرف على علامات الإنذار، وقياس الضغط في المنزل، وتكييف النشاط البدني يحسّن المآل بوضوح. في حال تدهور مفاجئ، أو ضيق تنفس أثناء الراحة، أو ألم صدري مستمر، أو إغماء، لا ينبغي انتظار الموعد القادم: اتصل بالرقم 15 (SAMU) أو توجّه إلى المستعجلات. يبقى الحوار المستمر مع طبيب قلبك أفضل ضمان لقلب يحظى برعاية جيدة.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب القلب بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "300 – 600 درهم" },
        { label: "تخطيط القلب (ECG)", value: "100 – 250 درهم" },
        { label: "تخطيط صدى القلب (إيكو)", value: "400 – 900 درهم" },
        { label: "اختبار الجهد", value: "500 – 1 200 درهم" },
        { label: "هولتر ECG (24 ساعة)", value: "400 – 900 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },
  "pediatrie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الأطفال هو الطبيب المختص في الأطفال، من الولادة إلى المراهقة. يتابع النمو والتطور النفسي الحركي والصحة العامة للطفل، ويتكفّل بأمراض الطفولة الشائعة، ويُجري التلقيحات وفق الجدول الوطني المغربي. ويغطي طب الأطفال أيضًا الأمراض المزمنة كالربو والسكري من النوع الأول والحساسية الغذائية واضطرابات السلوك. وتتيح استشارة طبيب الأطفال بانتظام مراقبة حسن نمو طفلك والكشف المبكر عن أي شذوذ محتمل.",
    quandConsulter: [
      "حمى أو سعال أو صعوبات في التنفس لدى الطفل",
      "متابعة النمو والتطور النفسي الحركي",
      "التلقيحات وفق الجدول الوطني المغربي",
      "طفح جلدي أو حساسية أو اضطرابات هضمية",
      "اضطرابات السلوك أو التعلّم",
    ],
    faqs: [
      { q: "في أي سن يمكن للطفل استشارة طبيب أطفال؟", a: "يتابع طبيب الأطفال الأطفال منذ الولادة حتى 16-18 سنة. ويُنصح بالاستشارات الأولى في الأيام التالية للولادة للتأكد من الحالة الصحية للمولود." },
      { q: "ما الفرق بين طبيب الأطفال والطبيب العام بالنسبة للأطفال؟", a: "طبيب الأطفال مكوَّن خصيصًا في أمراض الطفل والتطور لدى الأطفال. ويُفضَّل للحالات المعقدة والرضّع ومتابعة الأمراض المزمنة لدى الأطفال." },
      { q: "كم تكلّف استشارة طب الأطفال بالمغرب؟", a: "تكلّف الاستشارة لدى طبيب الأطفال عمومًا بين 200 و400 درهم بالمغرب حسب المدينة والممارس. وتسترجع CNSS وAMO جزءًا من المصاريف." },
      { q: "كيف أجد طبيب أطفال بالقرب مني؟", a: "استعمل بحث صحة بالمغرب لتصفية أطباء الأطفال حسب المدينة، والاطّلاع على آراء المرضى الموثوقة، وحجز موعد عبر الإنترنت مجانًا." },
      { q: "هل يجب إحضار دفتر الصحة في كل زيارة لطبيب الأطفال؟", a: "نعم، دفتر الصحة ضروري في كل زيارة. فهو يمكّن طبيب الأطفال من متابعة منحنى النمو، والتحقق من اللقاحات التي تلقاها الطفل، وتدوين الإجراءات الجديدة. وفي حالة الطوارئ أو تغيير الطبيب، يجمع هذا المستند التاريخ الطبي لطفلك في مكان واحد." },
      { q: "هل تُعوَّض زيارة طبيب الأطفال في المغرب من طرف CNSS أو AMO؟", a: "قد تخوّل استشارات طبيب الأطفال المتعاقد الحصول على تعويض جزئي من CNSS أو AMO، استناداً إلى التعريفة الوطنية المرجعية (TNR) الخاصة بـANAM. ويتوقف المبلغ المُعوَّض على نظامك وعلى القطاع الذي يزاول فيه الطبيب؛ احتفظ بورقة العلاج لملفك. أما في القطاع العام فتتبع التغطية قواعد المؤسسات الصحية." },
      { q: "طفلي يعاني من اضطراب في النوم أو التغذية: هل يمكن لطبيب الأطفال المساعدة؟", a: "نعم، يُقيّم طبيب الأطفال بشكل معتاد صعوبات النوم أو الشهية أو إدخال الأطعمة. فهو يبحث عن أسباب طبية محتملة ويقدم نصائح ملائمة لسن الطفل. وعند الحاجة، يوجّه إلى مختص مثل أخصائي التغذية أو طبيب نفسي للأطفال." },
      { q: "متى يوجّه طبيب الأطفال إلى طبيب أطفال متخصص دقيق؟", a: "يضمن طبيب الأطفال العام المتابعة الاعتيادية، لكنه يوجّه إلى طبيب متخصص دقيق (طبيب قلب الأطفال، طبيب أعصاب الأطفال، طبيب الغدد للأطفال…) عندما تستدعي مشكلة محددة ذلك. يضمن هذا التوجيه رعاية متخصصة مع الحفاظ على متابعة شاملة. وتتوفر هذه التخصصات الدقيقة أساساً في المدن الكبرى والمراكز الاستشفائية الجامعية." },
      { q: "كيف تتم متابعة الطفل الخديج أو حديث الولادة الهش في المغرب؟", a: "بعد الخروج من مصلحة الولادة أو حديثي الولادة، يتولى طبيب الأطفال المتابعة الحثيثة للطفل الخديج، أحياناً بالتنسيق مع المصلحة الاستشفائية. وتكون الزيارات أكثر تواتراً لمراقبة الوزن والنمو واستدراك التطور. وفي حالة صعوبة في التنفس أو رفض واضح للرضاعة، اتصل دون تأخير بالمستعجلات أو بالإسعاف (15)." },
    ],
    essentiel: [
      { value: "200 – 400 درهم", label: "ثمن الاستشارة" },
      { value: "0 – 16 سنة", label: "متابعة الطفل" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "المتابعة المنتظمة للطفل: النمو والتلقيحات",
        body: [
          "يتابع طبيب الأطفال النمو (الوزن، الطول، محيط الرأس) والتطور النفسي الحركي للطفل في أعمار مفتاحية، ويحدّث التلقيحات وفق الجدول الوطني المغربي.",
          "وتتيح استشارات المتابعة هذه، حتى لدى طفل بصحة جيدة، الكشف المبكر عن اضطراب في النمو أو البصر أو السمع أو التطور، وطمأنة الوالدين.",
        ],
      },
      {
        h: "طبيب الأطفال أم الطبيب العام: من تستشير لطفلك؟",
        body: [
          "يتكفّل الطبيب العام بأسباب كثيرة شائعة لدى الطفل. أما طبيب الأطفال، أخصائي الطفل، فمُستطبّ خاصة للرضّع والحالات المعقّدة ومتابعة الأمراض المزمنة لدى الأطفال.",
          "وتستشير عائلات كثيرة طبيب أطفال في السنوات الأولى، ثم تناوب حسب الحاجة. والأهمّ ضمان متابعة منتظمة وتلقيحات محدَّثة.",
        ],
      },
      {
        h: "الحمى والعدوى لدى الطفل: متى نقلق؟",
        body: [
          "الحمى شائعة جدًّا وغالبًا حميدة لدى الطفل. لكن بعض العلامات تفرض استشارة سريعة: حمى لدى رضيع أقل من 3 أشهر، صعوبة في التنفّس، نعاس غير معتاد، رفض الشرب، أو طفح لا يزول بالضغط.",
          "ويميّز طبيب الأطفال العدوى الفيروسية الشائعة، التي تُشفى وحدها، عن الحالات المحتاجة إلى علاج، ويشرح للوالدين علامات الإنذار الواجب مراقبتها.",
        ],
      },
      {
        h: "التلقيحات وفق الجدول المغربي",
        body: [
          "يتوفّر المغرب على برنامج وطني للتلقيح يحمي الطفل من أمراض خطيرة عديدة منذ الأشهر الأولى. واحترام الجدول أساسي للمناعة الجماعية.",
          "ويُجري طبيب الأطفال التلقيحات، ويحدّث دفتر الصحة، وينصح الوالدين بشأن الجرعات المعزّزة والتلقيحات التكميلية المحتملة.",
        ],
      },
      {
        h: "الخداجة وحديث الولادة: متابعة طبية مكثفة",
        body: [
          "تُعد الأسابيع الأولى من الحياة حاسمة، لا سيما بالنسبة للطفل المولود قبل أوانه أو ذي الوزن المنخفض. ينظّم طبيب الأطفال متابعة مكثفة بعد الخروج من مصلحة الولادة أو مصلحة حديثي الولادة: وزن منتظم، ومراقبة منحنى النمو، وفحص التوتر العضلي والتطور، والتأكد من حسن الرضاعة. يتيح هذا الجدول الزمني للزيارات، الأكثر كثافة مقارنة بالرضيع المولود في أوانه، الكشف المبكر عن أي تأخر محتمل في النمو أو صعوبة في التغذية.",
          "في المغرب، تتوزع هذه المتابعة غالباً بين طبيب الأطفال في المدينة والمصلحة الاستشفائية المرجعية، خصوصاً في المدن الكبرى التي تتوفر على وحدة لحديثي الولادة. ويؤدي الآباء دوراً محورياً: فهم يصفون النوم والقلس وعدد الحفاضات ويقظة الطفل. وتفرض بعض العلامات رد فعل فورياً، مثل ضيق التنفس أو لون البشرة الرمادي أو المزرق أو الحمى لدى رضيع صغير جداً أو الرفض التام للرضاعة؛ في هذه الحالات، يجب الاتصال دون تأخير بالمستعجلات أو بالإسعاف (15).",
        ],
      },
      {
        h: "فهم منحنى النمو وتطور الطفل",
        body: [
          "في كل استشارة، يدوّن طبيب الأطفال الوزن والطول ومحيط الرأس على منحنيات دفتر الصحة. وما يهم ليس رقماً معزولاً بل انتظام التطور: فالطفل الذي يتابع مساره في النمو بشكل متناسق يكون مطمئناً عموماً، في حين أن انكسار المنحنى أو تسارعاً غير معتاد يستحق الاستكشاف. تتيح هذه المتابعة أيضاً الكشف المبكر عن حالات مثل بداية زيادة الوزن أو نمو غير كافٍ، وهي أسباب استشارة متكررة في المغرب.",
          "إلى جانب القياسات، يُقيّم طبيب الأطفال التطور النفسي الحركي: التحكم في الرأس، والجلوس، والمشي، والكلمات الأولى، والتفاعلات واللغة. تتباين هذه المعالم من طفل لآخر، ولا يكون التأخر الطفيف مقلقاً دائماً. ويتمثل دور طبيب الأطفال في التمييز بين التغيرات الطبيعية والعلامات التي تستدعي فحوصات إضافية أو توجيهاً إلى مختص، مع إطلاع الآباء على أنواع التحفيز الملائمة لسن طفلهم.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة طب الأطفال بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة وتختلف حسب المدينة والممارس. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة متابعة", value: "200 – 400 درهم" },
        { label: "استشارة المولود الجديد", value: "250 – 450 درهم" },
        { label: "تلقيح (عمل)", value: "100 – 250 درهم" },
        { label: "استشارة في عيادة خاصة", value: "300 – 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). لقاحات البرنامج الوطني مجانية في المراكز الصحية العمومية. يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي.",
    },
  },
  "gyneco-obstetrique": {
    reviewed: "2026-07-05",
    description:
      "طبيب أمراض النساء هو المختص في صحة المرأة، ويغطي الصحة الإنجابية والحمل والولادة وأمراض الجهاز التناسلي الأنثوي. وبالمغرب، تُعدّ المتابعة النسائية المنتظمة أساسية للكشف عن سرطان عنق الرحم والثدي. ويتكفّل طبيب أمراض النساء والتوليد أيضًا بالحمل عالي الخطورة ويُجري الولادات. ويُنصح بالاستشارة السنوية منذ بداية الحياة الجنسية النشطة، بصرف النظر عن أي عرض.",
    quandConsulter: [
      "متابعة نسائية سنوية ومسحة عنق الرحم",
      "الحمل والمتابعة قبل الولادة",
      "اضطرابات الدورة الشهرية",
      "آلام حوضية غير مفسَّرة",
      "وسائل منع الحمل وتنظيم الأسرة",
    ],
    faqs: [
      { q: "ابتداءً من أي سن تُستشار طبيبة أمراض النساء؟", a: "يُنصح بالاستشارة النسائية الأولى منذ بداية الحياة الجنسية النشطة أو نحو 18-20 سنة، حتى في غياب أعراض، لإجراء فحص أساسي ومسحة عنق الرحم." },
      { q: "كم تكلّف استشارة أمراض النساء بالمغرب؟", a: "تكلّف الاستشارة لدى طبيب أمراض النساء بالمغرب بين 250 و500 درهم حسب الممارس والفحوص المُجراة. وتتكفّل CNSS وAMO بجزء من المصاريف." },
      { q: "ما الفرق بين طبيب أمراض النساء وطبيب التوليد؟", a: "يهتم طبيب أمراض النساء بصحة المرأة عمومًا، بينما يتخصص طبيب التوليد في متابعة الحمل والولادات. ويجمع معظم الممارسين بالمغرب بين التخصصين." },
      { q: "كيف أحجز موعدًا مع طبيب أمراض النساء؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « أمراض النساء » ومدينتك لإيجاد طبيب متاح والحجز عبر الإنترنت مجانًا." },
      { q: "هل يلزم طبيب نساء أم قابلة للولادة في المغرب؟", a: "يتدخل الطرفان حسب الحالة. في القطاع العام ودور الولادة، تشرف القابلات على معظم الولادات الطبيعية، مع توفر طبيب نساء وتوليد عند حدوث مضاعفات. أما في العيادات الخاصة فغالبا ما يتابع طبيب النساء الولادة مباشرة. وفي حالات الحمل عالي الخطورة (السكري، ارتفاع الضغط، التوائم) يُنصح بمتابعة توليدية متخصصة." },
      { q: "هل يغطي CNSS أو AMO استشارة طب النساء والولادة؟", a: "يعوّض نظام AMO (عبر CNSS للأجراء) جزءا من الاستشارات والأعمال الطبية حسب التعريفة الوطنية المرجعية (TNR) التي تحددها ANAM. وفي القطاع الخاص تبقى الأتعاب حرة، فيظل جزء على عاتق المريضة غالبا. تُغطى الولادة والمتابعة قبل الولادة وبعض الفحوص جزئيا. اطلبي دائما فاتورة وورقة العلاجات لتكوين ملف التعويض." },
      { q: "ماذا أفعل عند حدوث نزيف أو آلام شديدة أثناء الحمل؟", a: "النزيف الغزير أو الآلام البطنية الحادة أو الحمى أو نقص حركة الجنين تستدعي استشارة طبية عاجلة دون انتظار الموعد المقبل. اتصلي بطبيبك أو توجّهي إلى مستعجلات أقرب مستشفى للولادة. وعند وجود خطر شديد اتصلي بالإسعاف SAMU على الرقم 15. فهذه العلامات قد تدل على مضاعفة تُعالَج بشكل أفضل كلما تم التكفل بها مبكرا." },
      { q: "كيف أستعد لأول استشارة عند طبيب النساء؟", a: "دوّني تاريخ آخر دورة شهرية ومدى انتظام دورتك وأي أعراض تشعرين بها. أحضري نتائجك السابقة (المسحة، الصدى، التحاليل) ولائحة أدويتك. يُنصح بتجنب العلاقات والتحاميل خلال 48 ساعة السابقة للمسحة. ولا تترددي في تحضير أسئلتك مسبقا، فالاستشارة فضاء سرّي يمكن فيه تناول كل المواضيع." },
      { q: "إلى أي طبيب أتوجه عند صعوبة في الإنجاب؟", a: "بعد نحو سنة من العلاقات المنتظمة دون حمل (ستة أشهر بعد سن 35)، يُنصح باستشارة طبيب نساء يمكنه توجيهك نحو تقييم خصوبة الزوجين. بعض أطباء النساء متخصصون في طب الإنجاب ويعملون مع مراكز المساعدة الطبية على الإنجاب (AMP). ويشمل التقييم المرأة والرجل معا لاقتراح تكفّل ملائم." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "مرة سنويًّا", label: "المتابعة النسائية المنصوح بها" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "المتابعة النسائية السنوية ومسحة عنق الرحم",
        body: [
          "يُنصح باستشارة نسائية سنوية منذ بداية الحياة الجنسية، حتى دون أعراض. وتشمل فحصًا، ودوريًّا مسحة عنق الرحم.",
          "وتكشف المسحة مبكرًا آفات عنق الرحم، فتتفادى التطوّر نحو سرطان. وهي من أنجع وسائل الكشف في صحة المرأة.",
        ],
      },
      {
        h: "الحمل: المتابعة قبل الولادة بالمغرب",
        body: [
          "تجمع متابعة الحمل بين استشارات شهرية وفحوص بالصدى (التأريخ، التشكّل، النمو) لمراقبة صحة الأم والجنين والكشف عن مضاعفات محتملة.",
          "ويتكفّل طبيب أمراض النساء والتوليد بالحمل، بما فيه عالي الخطورة، وبالولادة. والمتابعة المنتظمة منذ بداية الحمل أساسية لحسن سيره.",
        ],
      },
      {
        h: "وسائل منع الحمل وتنظيم الأسرة",
        body: [
          "يرافق طبيب أمراض النساء اختيار وسيلة منع حمل مناسبة (حبوب، لولب، غرسة) حسب السنّ والسوابق ونمط الحياة، ويضمن متابعتها.",
          "كما يُعلم بشأن تنظيم الأسرة والوقاية من العدوى المنقولة جنسيًّا، في إطار سرّي ودون حكم.",
        ],
      },
      {
        h: "الكشف عن سرطانات المرأة",
        body: [
          "إلى جانب مسحة عنق الرحم، يساهم طبيب أمراض النساء في الكشف عن سرطان الثدي بالفحص السريري والتوجيه إلى تصوير الثدي في الأعمار المنصوح بها.",
          "وعند اكتشافها مبكرًا، تُعالَج هذه السرطانات بحظوظ شفاء أفضل بكثير. والمتابعة المنتظمة مفتاح وقاية فعّالة.",
        ],
      },
      {
        h: "سن اليأس وصحة المرأة بعد سن 45",
        body: [
          "يشير سن اليأس، الذي يحدث عادة حوالي الخمسين، إلى توقف الدورة الشهرية وقد يصاحبه هبات حرارة واضطرابات في النوم أو جفاف. أما المرحلة التي تسبقه، وهي ما قبل سن اليأس، فقد تمتد عدة سنوات مع دورات غير منتظمة. يرافق طبيب النساء هذا الانتقال ويستبعد الأسباب الأخرى المحتملة للأعراض، ويقترح عند اللزوم علاجا ملائما بعد تقييم نسبة الفائدة إلى الخطر.",
          "إلى جانب الراحة اليومية، تشكل هذه المرحلة فرصة لمتابعة معززة: مراقبة العظام للوقاية من هشاشتها، ومتابعة القلب والأوعية، ومواصلة الكشف عن سرطاني الثدي وعنق الرحم. وفي المغرب تجمع هذه المتابعة بين استشارات طب النساء، وعند الحاجة، آراء أخصائيين آخرين. ويبقى نمط حياة صحي (النشاط البدني والتغذية المتوازنة والإقلاع عن التدخين) أساس الوقاية في هذه السن.",
        ],
      },
      {
        h: "الالتهابات النسائية والصحة الحميمة: متى تجب الاستشارة",
        body: [
          "الإفرازات غير المعتادة والحكة والحرقان أثناء التبول أو الآلام خلال العلاقات من أسباب الاستشارة الشائعة في المغرب. معظم هذه الاضطرابات، مثل الفطريات أو التهابات المهبل، تُعالَج بسهولة بعد تحديد التشخيص. أما التداوي الذاتي المتكرر فقد يخفي على العكس عدوى كامنة أو يغذّي الانتكاسات، بينما يتيح الفحص وأخذ عينة عند الحاجة توجيه العلاج بدقة.",
          "بعض العدوى المنقولة جنسيا قد تتطور بصمت، وإذا لم تُعالَج قد تؤثر على الخصوبة. يقترح طبيب النساء الكشف، ويقدم المعلومات حول الوقاية (الواقي الذكري، التلقيح ضد فيروس الورم الحليمي عند وجود دواعيه)، ويتكفل بالشريك عند الاقتضاء. وفي حالة حمى مرتفعة مع آلام حوضية شديدة يلزم تقييم عاجل، عند الضرورة عبر المستعجلات أو الإسعاف SAMU (15).",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب أمراض النساء بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص ومتابعة الحمل على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "250 – 500 درهم" },
        { label: "مسحة عنق الرحم", value: "150 – 400 درهم" },
        { label: "صدى حوضي", value: "300 – 600 درهم" },
        { label: "صدى التوليد (الحمل)", value: "400 – 800 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي، خاصة لمتابعة الحمل.",
    },
  },
  "dermatologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الأمراض الجلدية هو المختص في أمراض الجلد والأغشية المخاطية والشعر والأظافر. يشخّص ويعالج حب الشباب والإكزيما والصدفية والعدوى الجلدية والحساسية، ويراقب الآفات المشبوهة التي قد توحي بورم ميلانيني. وبالمغرب، يجعل التعرّض الشمسي القوي المتابعة الجلدية مهمة بشكل خاص للكشف المبكر عن سرطانات الجلد. كما يُجري طبيب الجلد أعمالًا تجميلية كعلاج الندوب والتقشير وحقن حمض الهيالورونيك.",
    quandConsulter: [
      "حب شباب حاد أو مقاوم للعلاجات الموضعية",
      "طفح جلدي أو إكزيما أو صدفية",
      "مراقبة آفة أو شامة مشبوهة",
      "تساقط الشعر (الثعلبة)",
      "عدوى جلدية أو فطريات مستمرة",
    ],
    faqs: [
      { q: "متى يجب استشارة طبيب الجلد بشكل عاجل؟", a: "استشِر طبيب الجلد بسرعة إذا لاحظت شامة تتغير في شكلها أو لونها أو تنزف، أو آفة جلدية لا تلتئم، أو طفحًا منتشرًا مصحوبًا بحمى." },
      { q: "كم تكلّف استشارة الأمراض الجلدية بالمغرب؟", a: "يتراوح سعر الاستشارة لدى طبيب الجلد بين 250 و500 درهم بالمغرب حسب المدينة والأعمال المُجراة. وتخضع الخزعات الجلدية أو العلاج بالتبريد لمصاريف إضافية." },
      { q: "هل يعالج طبيب الجلد مشاكل الشعر؟", a: "نعم، يتكفّل طبيب الجلد بأمراض فروة الرأس وتساقط الشعر (الثعلبة الأندروجينية، الحاصة البقعية)، ويُجري خزعات لفروة الرأس عند الحاجة." },
      { q: "كيف أجد طبيب جلد بالمغرب؟", a: "تُدرج صحة بالمغرب جميع أطباء الجلد الموثوقين مع آراء المرضى والأسعار والمواعيد لحجز فوري عبر الإنترنت." },
      { q: "هل أحتاج إلى رسالة من طبيبي المعالج لاستشارة طبيب الأمراض الجلدية في المغرب؟", a: "لا، طبيب الأمراض الجلدية أخصائي يمكن الوصول إليه مباشرة: بإمكانك أخذ موعد دون المرور مسبقاً على طبيب عام. غير أن بعض التعاضديات أو نظام AMO قد يطلب ورقة علاج أو وصفة طبية لاسترجاع تكاليف بعض الأعمال أو العلاجات. من المفيد التحقق من شروط تغطيتك قبل الاستشارة." },
      { q: "كيف أُحضّر لاستشارتي عند طبيب الأمراض الجلدية؟", a: "احضر ببشرة نظيفة، دون مساحيق تجميل أو طلاء أظافر إذا كان سبب الاستشارة يخص الوجه أو الجلد أو الأظافر، لأن ذلك يسهّل الفحص. أحضر لائحة أدويتك الحالية ووصفاتك القديمة والكريمات التي جربتها من قبل. دوّن تاريخ ظهور الآفة وتطورها: فهذه المعلومات كثيراً ما توجّه التشخيص." },
      { q: "هل يمكن لطبيب الأمراض الجلدية إجراء خزعة من الجلد أثناء الاستشارة؟", a: "نعم، يمكن إجراء خزعة جلدية صغيرة مباشرة في العيادة تحت تخدير موضعي، في بضع دقائق، لتحليل آفة مشبوهة. تُرسل العينة بعد ذلك إلى مختبر التشريح المرضي وتعود النتائج عموماً خلال أسبوع إلى أسبوعين. إنه إجراء شائع وقليل الألم يتيح تأكيد التشخيص." },
      { q: "ابتداءً من أي سن يمكن اصطحاب طفل إلى طبيب الأمراض الجلدية؟", a: "لا يوجد سن أدنى: يمكن للرضّع والأطفال الاستشارة لمشاكل شائعة كالإكزيما والأورام الوعائية والثآليل والوحمات. بعض أطباء الأمراض الجلدية في المغرب لهم توجه لطب الأطفال. في حال حمى مصحوبة بطفح جلدي عند طفل صغير، اتصل أولاً بطبيب أو بالرقم 15 (SAMU) دون انتظار." },
      { q: "ما الفحوصات التي يمكن لطبيب الأمراض الجلدية وصفها أو إجراؤها؟", a: "حسب السبب، يمكنه إجراء تنظير الجلد (فحص الشامات بعدسة مكبّرة مضيئة)، أو أخذ عينة فطرية للبحث عن فطر، أو خزعة. كما يمكنه وصف تحليل دم أو فحص للحساسية أو فحص جرثومي. هذه الفحوصات التكميلية ليست منهجية وتتوقف على حالتك." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "الجلد · الشعر · الأظافر", label: "مجال التخصص" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "حب الشباب: التدخّل مبكرًا لتفادي الندوب",
        body: [
          "حب الشباب، الشائع في المراهقة وكذلك لدى البالغ، قد يترك ندوبًا دائمة إذا لم يُعالَج. ويقترح طبيب الجلد علاجات مناسبة لشدّته، من العلاجات الموضعية إلى العلاجات الفموية.",
          "ويحدّ التكفّل المبكر من الآفات ويحفظ البشرة على المدى البعيد. تجنّب التطبيب الذاتي العدواني الذي يفاقم الالتهاب غالبًا.",
        ],
      },
      {
        h: "مراقبة الشامات: الكشف عن الورم الميلانيني",
        body: [
          "بالمغرب، يرفع التعرّض الشمسي القوي خطر الآفات الجلدية. وأي شامة تتغيّر في شكلها أو لونها أو حجمها، أو تنزف، يجب عرضها على طبيب جلد.",
          "ويتيح فحص منتظم للبشرة الكشف المبكر عن الورم الميلانيني وسرطانات الجلد الأخرى، التي يكون مآلها ممتازًا عند أخذها في حينها.",
        ],
      },
      {
        h: "الإكزيما والصدفية وأمراض الجلد المزمنة",
        body: [
          "الإكزيما والصدفية مرضان التهابيان مزمنان يتطوّران على شكل نوبات. ولا يُشفيان نهائيًّا لكن يُتحكَّم فيهما جيدًا بعلاج مناسب.",
          "ويحدّد طبيب الجلد العوامل المثيرة (التوتر، مسبّبات الحساسية، المناخ) ويقترح استراتيجية لمباعدة النوبات وتحسين الراحة.",
        ],
      },
      {
        h: "طب الجلد التجميلي: ما يُسترجَع وما لا يُسترجَع",
        body: [
          "يُجري طبيب الجلد أيضًا أعمالًا تجميلية: علاج الندوب، التقشير، الليزر، الحقن. وتندرج هذه الأعمال ضمن الراحة ولا تُسترجَع عمومًا.",
          "في المقابل، تستفيد الاستشارات والعلاجات الطبية (حب الشباب، الآفات المشبوهة، أمراض الجلد) من تكفّل جزئي من CNSS وAMO.",
        ],
      },
      {
        h: "البشرة والشمس في المغرب: الوقاية وحروق الشمس",
        body: [
          "مع سطوع شمسي قوي خلال جزء كبير من السنة، تُعدّ الحماية من الشمس رهاناً صحياً يومياً في المغرب. فالتعرّض المتكرر دون حماية يسرّع شيخوخة البشرة ويرفع خطر الآفات الجلدية على المدى الطويل. ينصح طبيب الأمراض الجلدية بحماية ملائمة لنوع بشرتك: كريم بمعامل حماية عالٍ يُعاد وضعه كل ساعتين عند التعرّض، وقبعة ونظارات وملابس ساترة في أشد الساعات حرارة، مع تجنّب التعرّض المباشر بين الزوال والرابعة بعد الظهر.",
          "بعض الأشخاص يبدون تفاعلات خاصة مع الشمس: بقع صبغية (الكلف، الشائع بعد الحمل)، أو حساسية شمسية، أو تفاقم أمراض قائمة. حرق شمسي شديد مصحوب بفقاعات أو حمى أو توعّك، خاصة لدى طفل، يستدعي رأياً طبياً سريعاً، بل الاتصال بالرقم 15 (SAMU) عند ظهور علامات الجفاف. يمكن لطبيب الأمراض الجلدية اقتراح علاج للبقع وخطة وقاية مخصّصة.",
        ],
      },
      {
        h: "فهم الأتعاب واسترجاع تكاليف الأعمال الجلدية",
        body: [
          "في المغرب، أتعاب أطباء الأمراض الجلدية في القطاع الخاص حرة وتختلف حسب المدينة وخبرة الطبيب وطبيعة العمل الطبي. فالاستشارة البسيطة وتنظير الجلد والخزعة والعمل التقني لا تحمل نفس التسعيرة: من حقك السؤال عن المبلغ عند أخذ الموعد. أما في القطاع العام (المستشفيات والمراكز الاستشفائية الجامعية) فالأسعار مؤطّرة وأكثر يُسراً عموماً، مع آجال انتظار أطول أحياناً.",
          "يتوقف الاسترجاع على تغطيتك: يتكفّل نظام AMO (عبر CNSS أو هيئات أخرى) بجزء من الاستشارات والأعمال الطبية وفق التسعيرة الوطنية المرجعية (TNR) التي تحددها ANAM، بينما قد تغطي تعاضدية تكميلية الباقي. أما الأعمال التجميلية البحتة فلا تُسترجع. احتفظ دائماً بأوراق العلاج والفواتير المفصّلة، وتحقق لدى هيئتك من شروط التكفّل قبل أي عمل مكلف.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب الجلد بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الأعمال التقنية والتجميلية على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "250 – 500 درهم" },
        { label: "العلاج بالتبريد (ثؤلول، آفة)", value: "150 – 400 درهم" },
        { label: "خزعة جلدية", value: "300 – 700 درهم" },
        { label: "عمل تجميلي (تقشير، ليزر)", value: "ابتداءً من 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). تُسترجَع الأعمال الطبية جزئيًّا من CNSS وAMO؛ أما الأعمال التجميلية فلا تُسترجَع.",
    },
  },
  "ophtalmologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب العيون هو الطبيب المختص في العين والبصر. يشخّص ويعالج أمراض العين: قصر النظر، طول النظر، اللابؤرية، الساد (الكتاراكت)، الزرق (الغلوكوما)، التنكّس البقعي المرتبط بالسن، واعتلال الشبكية السكري. وبالمغرب، يبرّر انتشار الزرق والساد فحصًا منتظمًا، خاصة بعد سن 40. كما يصف طبيب العيون التصحيحات البصرية (النظارات والعدسات اللاصقة) بعد فحص كامل للانكسار.",
    quandConsulter: [
      "انخفاض مفاجئ أو تدريجي في البصر",
      "ألم في العين أو احمرار مستمر",
      "فحص النظر للنظارات أو العدسات اللاصقة",
      "الكشف عن الزرق (يُنصح به بعد سن 40)",
      "متابعة السكري (اعتلال الشبكية السكري)",
    ],
    faqs: [
      { q: "ما وتيرة استشارة طبيب العيون؟", a: "يُنصح بفحص كل سنتين للبالغين دون أمراض. بعد سن 40، يُنصح بكشف سنوي للزرق. ويجب على مرضى السكري الاستشارة كل 6 إلى 12 شهرًا." },
      { q: "ما الفرق بين أخصائي البصريات وطبيب العيون؟", a: "طبيب العيون طبيب يشخّص أمراض العين ويصف التصحيحات. أما أخصائي البصريات فهو مهني صحي يسلّم النظارات ويضبطها وفق الوصفة الطبية." },
      { q: "كم تكلّف استشارة لدى طبيب العيون بالمغرب؟", a: "تكلّف استشارة طب العيون بين 250 و500 درهم حسب المدينة والفحوص. ويخضع فحص قاع العين أو قياس ضغط العين أو OCT لمصاريف إضافية." },
      { q: "هل يمكن إجراء عملية لتصحيح قصر النظر بالمغرب؟", a: "نعم، تقترح عدة عيادات مغربية جراحة الانكسار (LASIK، PKR) لتصحيح قصر النظر. استشِر طبيب عيون لتقييم أهليتك حسب سُمك قرنيتك." },
      { q: "هل تغطي CNSS أو AMO متابعة طب العيون في المغرب؟", a: "تمنح استشارات وبعض أعمال طب العيون الحق في تعويض جزئي عبر AMO (CNSS للأجراء، CNOPS للوظيفة العمومية) على أساس التعريفة الوطنية المرجعية (TNR/ANAM). وبما أن أتعاب القطاع الخاص حرة، فقد يبقى جزء مهم على عاتق المريض. اطلب دائماً ورقة العلاجات واستفسر عن التكفل قبل أي جراحة مبرمجة (مثل الساد)." },
      { q: "في أي سن أفحص عيني طفلي؟", a: "يُنصح بفحص أول منذ الأشهر الأولى، ثم نحو سن 3 سنوات وقبل دخول المدرسة، حتى دون وجود علامات ظاهرة. الطفل الذي يضيّق عينيه، يقترب من الشاشات، يميل برأسه أو يجد صعوبة في الدراسة يجب فحصه بسرعة. الكشف المبكر عن الحول أو الغمش (العين الكسولة) أساسي لأن العلاج أكثر فعالية قبل سن 6-7 سنوات." },
      { q: "هل تضر الشاشات بالعيون فعلاً وكيف أخفف إجهاد النظر؟", a: "لا تُتلف الشاشات بنية العين، لكن استعمالها المطوّل يسبب غالباً إجهاداً بصرياً وجفافاً في العين (قلة الرمش). تساعد قاعدة 20-20-20: كل 20 دقيقة، انظر إلى مسافة نحو 6 أمتار لمدة 20 ثانية. إذا استمر الانزعاج أو الصداع أو تشوش الرؤية، استشر طبيب عيون للتحقق من تصحيحك." },
      { q: "هل يؤثر السكري على النظر وأي متابعة يجب توقعها؟", a: "نعم، السكري سبب متكرر لإصابة الشبكية (اعتلال الشبكية السكري) في المغرب وقد يتطور طويلاً دون أعراض. يُنصح بفحص قاع العين مرة واحدة سنوياً على الأقل لدى كل مريض سكري، وأكثر في حال وجود خلل. التوازن الجيد لسكر الدم والضغط يساعد على الحفاظ على النظر." },
      { q: "ما العلامات العينية التي تستوجب استشارة مستعجلة؟", a: "استشر بشكل مستعجل عند انخفاض مفاجئ في الرؤية، أو ألم عيني شديد، أو ظهور ستارة أو ومضات وذباب طائر فجأة، أو عين حمراء مؤلمة جداً مع رؤية مشوشة، أو بعد تناثر مادة كيميائية أو رضّ. في حال تناثر مادة كيميائية، اشطف بماء وفير فوراً. أمام حالة خطيرة أو عامة، اتصل بالرقم 15 (SAMU)." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "ابتداءً من 40", label: "الكشف عن الزرق" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "متى تفحص بصرك؟",
        body: [
          "يُنصح بفحص للبصر كل سنتين للبالغ دون مرض، وسنويًّا بعد سن 40 للكشف عن الزرق. ويجب فحص الأطفال عند ظهور علامات (حول، صعوبة في رؤية السبّورة).",
          "ويحتاج مرضى السكري إلى متابعة مقرّبة (كل 6 إلى 12 شهرًا) للكشف عن اعتلال الشبكية السكري، وهو سبب رئيسي للعمى القابل للتفادي بالمغرب.",
        ],
      },
      {
        h: "الزرق والساد: مرضان واجب الكشف عنهما",
        body: [
          "يُتلف الزرق العصب البصري بصمت ارتباطًا بارتفاع ضغط العين؛ ودون كشف، قد يؤدّي إلى العمى. ويتيح فحص بسيط بعد سن 40 اكتشافه وعلاجه في الوقت المناسب.",
          "أما الساد، أي تعتيم العدسة المرتبط بالسنّ، فيشوّش الرؤية تدريجيًّا. وعلاجه الجراحي، المتكرر والمُتقَن بالمغرب، يعيد البصر بفعالية.",
        ],
      },
      {
        h: "طبيب العيون أم أخصائي البصريات: من يفعل ماذا؟",
        body: [
          "طبيب العيون طبيب: يفحص العينين، ويكشف الأمراض، ويسلّم وصفة التصحيح. أما أخصائي البصريات فيصنع ويضبط النظارات والعدسات انطلاقًا من هذه الوصفة.",
          "وللحصول على نظارات مناسبة وكشف عن أمراض العين، يبقى الفحص لدى طبيب العيون الخطوة المرجعية؛ ويتدخّل أخصائي البصريات بعد ذلك للمعدات.",
        ],
      },
      {
        h: "جراحة قصر النظر والتصحيحات",
        body: [
          "تتيح جراحة الانكسار (LASIK، PKR) تصحيح قصر النظر وطول النظر واللابؤرية، وتُقترح في عدة عيادات مغربية بعد فحص يتحقّق من سُمك القرنية واستقرار البصر.",
          "وليس كل المرضى مؤهّلين. ويقيّم طبيب العيون الجدوى ويُعلم بالفوائد والحدود قبل أي قرار.",
        ],
      },
      {
        h: "السكري وارتفاع الضغط وصحة العيون: أهمية فحص قاع العين",
        body: [
          "بعض الأمراض العامة المنتشرة كثيراً في المغرب، مثل السكري وارتفاع ضغط الدم، تؤثر مباشرة على العيون. يمكن للسكري أن يُتلف تدريجياً أوعية الشبكية (اعتلال الشبكية السكري) دون أن يسبب ألماً أو انخفاضاً في الرؤية في البداية، وهذا الصمت بالذات هو ما يجعله خطيراً. كما يُضعف ارتفاع الضغط غير المتحكَّم فيه الشبكية أيضاً. لهذه الأسباب، يؤدي طبيب العيون دوراً أساسياً في الكشف، بالتنسيق مع الطبيب المعالج أو طبيب الغدد أو طبيب القلب.",
          "الفحص المحوري هو فحص قاع العين، وغالباً ما يُستكمل بصور للشبكية. لدى المريض السكري، يُنصح عموماً بمراقبة سنوية على الأقل، تُكيَّف حسب قِدَم السكري والنتائج. إذا اكتُشف اعتلال الشبكية في الوقت المناسب، يمكن مراقبته أو علاجه (ليزر، حقن) قبل أن يبلغ الرؤية. وإلى جانب المتابعة المتخصصة، يبقى أفضل حليف هو التوازن الجيد لسكر الدم والضغط والإقلاع عن التدخين.",
        ],
      },
      {
        h: "جفاف العين وإجهاد النظر المرتبط بالشاشات",
        body: [
          "أصبح جفاف العين سبباً متزايداً للاستشارة، يُحفّزه العمل على الشاشات والتكييف والرياح والغبار وارتداء العدسات لفترات طويلة. ويتجلى في إحساس بوجود رمل في العينين، ووخز، واحمرار، ورؤية متذبذبة، أو على العكس دمعان تفاعلي. أمام الشاشات، يقل الرمش كثيراً، ما يزيد الانزعاج مع مرور اليوم.",
          "غالباً ما تخفف إجراءات بسيطة من ذلك: تطبيق قاعدة 20-20-20 (استراحة بصرية منتظمة)، تذكّر الرمش، تهوية الهواء وترطيبه، وضع الشاشة أسفل مستوى العينين، وأخذ استراحات عند ارتداء العدسات. قد تساعد الدموع الاصطناعية الخالية من المواد الحافظة، لكن الانزعاج المستمر أو الألم أو انخفاض الرؤية يستوجب فحصاً: يتحقق طبيب العيون من سطح العين والتصحيح البصري ويستبعد سبباً آخر قبل اقتراح علاج مناسب.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب العيون بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص والجراحة على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "250 – 500 درهم" },
        { label: "فحص قاع العين / فحص تكميلي", value: "150 – 400 درهم" },
        { label: "عملية الساد (للعين الواحدة)", value: "5 000 – 12 000 درهم" },
        { label: "جراحة الانكسار LASIK (للعين)", value: "5 000 – 9 000 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للأعمال الطبية عند تقديم الوصفة؛ ونادرًا ما تُغطّى جراحة الانكسار التجميلية.",
    },
  },
  "neurologie": {
    description:
      "طبيب الأعصاب هو الطبيب المختص في أمراض الجهاز العصبي المركزي والمحيطي. يتكفّل بالصداع النصفي والصرع والسكتات الدماغية ومرض باركنسون وألزهايمر والتصلب اللويحي واعتلالات الأعصاب واضطرابات النوم. وبالمغرب، تمثّل السكتات الدماغية حالة طارئة عصبية كبرى: التعرّف على العلامات المبكرة (الشلل، اضطرابات النطق) والاستشارة بسرعة قد ينقذ الأرواح ويحدّ من العواقب.",
    quandConsulter: [
      "صداع حاد أو شقيقة متكررة",
      "فقدان الوعي أو نوبة صرع",
      "شلل أو خدر مفاجئ (طوارئ سكتة دماغية)",
      "رعشة أو اضطرابات في التوازن",
      "اضطرابات في الذاكرة أو التركيز",
    ],
    faqs: [
      { q: "ما علامات السكتة الدماغية الواجب معرفتها؟", a: "طبّق اختبار FAST: الوجه (تناظر مختل)، الذراع (ذراع يسقط)، النطق (اضطرابات في الكلام)، الوقت (اتصل بالإسعاف فورًا). كل دقيقة مهمة للحد من العواقب." },
      { q: "كم تكلّف استشارة لدى طبيب الأعصاب بالمغرب؟", a: "تكلّف الاستشارة العصبية بين 300 و600 درهم بالمغرب. وتخضع الفحوص التكميلية (EEG، EMG، الرنين المغناطيسي الدماغي) لمصاريف إضافية." },
      { q: "هل تلزم وصفة لاستشارة طبيب الأعصاب؟", a: "إحالة الطبيب العام مستحسنة لتكفّل أفضل وللاسترجاع من CNSS أو AMO، لكنها ليست إلزامية للاستشارة المباشرة." },
      { q: "كيف أجد طبيب أعصاب بالمغرب؟", a: "تُدرج صحة بالمغرب أطباء الأعصاب الموثوقين مع آرائهم ومواعيدهم. صفِّ حسب المدينة لإيجاد أقرب ممارس والحجز عبر الإنترنت." },
      { q: "هل يتم تعويض تصوير الدماغ بالرنين المغناطيسي (IRM) من طرف CNSS أو AMO في المغرب؟", a: "تصوير الرنين المغناطيسي والسكانير الدماغي الموصوفان من طرف طبيب الأعصاب يشملهما التغطية الصحية الإجبارية AMO (CNSS أو CNOPS) وفق التسعيرة الوطنية المرجعية، مع بقاء جزء من الكلفة على عاتقك (الاقتطاع المُعدِّل). تختلف نسبة التعويض حسب نظامك وحسب القطاع (عمومي أو خاص متعاقد). احتفظ بالوصفة الطبية وبورقة التكفل عند الاقتضاء لتكوين ملف التعويض." },
      { q: "ما الفرق بين طبيب الأعصاب وجرّاح الأعصاب؟", a: "طبيب الأعصاب طبيب مختص يُشخّص ويعالج بالأدوية أمراض الجهاز العصبي (السكتة الدماغية، الشقيقة، الصرع، التصلب اللويحي). أما جرّاح الأعصاب فيُجري العمليات (الفتق الغضروفي، ورم الدماغ، انضغاط العصب). في المغرب، يوجّهك طبيب الأعصاب نحو جرّاح الأعصاب إذا كانت هناك حاجة للتدخل الجراحي، وغالبًا ما يتعاون الطبيبان على الملف نفسه." },
      { q: "هل تخطيط كهربية الدماغ (EEG) مؤلم؟", a: "لا، تخطيط كهربية الدماغ غير مؤلم إطلاقًا وبدون خطر. تُوضع أقطاب كهربائية على فروة الرأس لتسجيل النشاط الكهربائي للدماغ، ولا يُرسَل أي تيار كهربائي إلى الرأس. يستغرق الفحص حوالي 20 إلى 30 دقيقة ويُجرى في عيادة طب الأعصاب أو في مصحة، غالبًا لاستكشاف الصرع أو حالات الإغماء غير المُفسَّرة." },
      { q: "ماذا أفعل في حالة تنميل أو خدر مستمر في اليدين أو الساقين؟", a: "التنميل المزمن (المذل) قد يدل على إصابة في الأعصاب الطرفية، وهو أمر شائع خاصة لدى المصابين بداء السكري في المغرب. تسمح استشارة طبيب الأعصاب، المُكمَّلة أحيانًا بتخطيط كهربية العضل (EMG)، بتحديد السبب. في المقابل، فإن الخدر المفاجئ في جانب واحد من الجسم حالة مستعجلة: اتصل فورًا بالرقم 15 (SAMU) لأنه قد يكون سكتة دماغية." },
      { q: "هل يمكن قيادة السيارة عند المتابعة بسبب الصرع أو مرض عصبي في المغرب؟", a: "قد تكون القيادة ممنوعة مؤقتًا، خاصة بعد نوبة صرع أو في حالة النعاس المرتبط ببعض العلاجات. يُقيّم طبيب الأعصاب أهليتك حالة بحالة وينصحك بالمدد الواجب احترامها. من المهم اتباع هذه التوصيات من أجل سلامتك وسلامة باقي مستعملي الطريق." },
    ],
    reviewed: "2026-07-05",
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "طوارئ السكتة", label: "اختبار FAST · اتصل بـ 15" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "السكتة الدماغية: التعرّف على العلامات والتصرّف بسرعة",
        body: [
          "السكتة الدماغية حالة طارئة قصوى. ويلخّص اختبار FAST العلامات الواجب معرفتها: الوجه (تدلّي جهة من الوجه)، الذراع (ذراع لا يرتفع)، النطق (كلام مضطرب)، الوقت (اتصل فورًا بـ 15). وكل دقيقة ضائعة تزيد العواقب.",
          "بالمغرب، تُعدّ السكتة الدماغية سببًا رئيسيًّا للإعاقة. ويمكن للتكفّل في الساعات الأولى أن يذيب الخثرة ويحدّ من الضرر: لا تستهِن أبدًا بعجز مفاجئ، حتى وإن كان عابرًا.",
        ],
      },
      {
        h: "الشقيقة والصداع المزمن",
        body: [
          "تتميّز الشقيقة عن الصداع العادي بنوبات حادة، غالبًا في جهة واحدة، نابضة، تزداد مع الضوء والضجيج. وقد تكون معطِّلة جدًّا وتستدعي رأيًا طبيًّا عندما تتكرّر.",
          "يؤكّد طبيب الأعصاب التشخيص ويستبعد الأسباب الثانوية، ويقترح علاجًا للنوبة وعلاجًا وقائيًّا للتقليل من تواترها واستعادة حياة طبيعية.",
        ],
      },
      {
        h: "الصرع: التشخيص والمتابعة",
        body: [
          "يتجلّى الصرع في نوبات مرتبطة بنشاط كهربائي غير طبيعي في الدماغ، بأشكال متنوّعة جدًّا (تشنّجات، غيابات، أحاسيس غير معتادة). ويساعد تخطيط الدماغ (EEG) والتصوير على التشخيص.",
          "وبعلاج جيّد، يتيح الصرع غالبًا حياة طبيعية. ويكيّف طبيب الأعصاب العلاج ويشرح الاحتياطات (النوم، السياقة) ويؤمّن متابعة منتظمة.",
        ],
      },
      {
        h: "باركنسون وألزهايمر واضطرابات الذاكرة",
        body: [
          "تظهر الأمراض التنكّسية العصبية (باركنسون، ألزهايمر) خاصة مع التقدّم في السن: رعشة وبطء لأحدهما، واضطرابات في الذاكرة والتوجّه للآخر. وتتطوّر تدريجيًّا.",
          "ويتيح التشخيص المبكر بدء العلاج ومرافقة المريض وأسرته والحفاظ على الاستقلالية مدة أطول. وتستحق كل شكوى ذاكرة مستمرة رأيًا عصبيًّا.",
        ],
      },
      {
        h: "التصلب اللويحي: التشخيص والتكفل في المغرب",
        body: [
          "التصلب اللويحي مرض يصيب الجهاز العصبي المركزي ويطال غالبًا الأشخاص في سن الشباب. يتجلى في نوبات غير متوقعة: اضطرابات في الرؤية، تعب شديد، ضعف أو تنميل في الأطراف، اضطرابات في التوازن. يعتمد التشخيص على الفحص السريري الذي يجريه طبيب الأعصاب، والتصوير بالرنين المغناطيسي للدماغ والنخاع الشوكي، وأحيانًا البزل القطني. التشخيص المبكر ضروري للحفاظ على الاستقلالية على المدى الطويل.",
          "في المغرب، يجمع التكفل بين العلاجات الأساسية (مُعدِّلات المناعة)، وعلاج النوبات، وإعادة التأهيل الملائمة. تتيح المتابعة العصبية المنتظمة تعديل العلاج ومراقبة التطور عبر الرنين المغناطيسي. قد تستفيد بعض العلاجات الأساسية من تغطية AMO في إطار الأمراض المزمنة طويلة الأمد (ALD)؛ استفسر لدى هيئتك (CNSS أو CNOPS) واحتفظ بجميع وثائقك الطبية المُثبِتة.",
        ],
      },
      {
        h: "التحضير الجيد لاستشارة طبيب الأعصاب",
        body: [
          "تصبح استشارة طب الأعصاب أكثر فعالية إذا حضّرت لها جيدًا. سجّل التسلسل الزمني الدقيق لأعراضك (تاريخ الظهور، التواتر، المدة، العوامل المُحفِّزة مثل التوتر أو قلة النوم أو بعض الأطعمة) وأحضر لائحة بجميع أدويتك الحالية. توجّه هذه المعلومات التشخيص بشكل كبير، خاصة في حالات الصداع أو الإغماء أو اضطرابات الذاكرة.",
          "احرص على جمع فحوصاتك السابقة: تقارير الرنين المغناطيسي أو السكانير، نتائج تخطيط كهربية الدماغ (EEG) أو العضل (EMG)، الوصفات السابقة والتحاليل الدموية. إذا كانت أعراضك متقطعة (نوبات، دوار، رعشة)، فإن مقطع فيديو قصيرًا مصوّرًا بهاتفك أثناء النوبة قد يكون مفيدًا جدًا لطبيب الأعصاب. أخيرًا، احضر برفقة شخص إذا كانت اضطرابات الذاكرة أو اليقظة تجعل سرد الأعراض صعبًا.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب أعصاب بالمغرب؟",
      intro:
        "أتعاب الاستشارة حرّة؛ وتُفوتَر الفحوص التكميلية على حدة. فيما يلي فئات إرشادية.",
      rows: [
        { label: "الاستشارة", value: "300 – 600 درهم" },
        { label: "تخطيط كهربائية الدماغ (EEG)", value: "300 – 700 درهم" },
        { label: "تخطيط كهربائية العضلات (EMG)", value: "400 – 900 درهم" },
        { label: "الرنين المغناطيسي الدماغي", value: "1 500 – 3 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },
  "endocrinologie-et-maladies-metaboliques": {
    reviewed: "2026-07-05",
    description:
      "طبيب الغدد الصمّاء هو الطبيب المختص في الهرمونات والأمراض الاستقلابية. يشخّص ويعالج داء السكري واضطرابات الغدة الدرقية (قصور، فرط النشاط، عقيدات، دُراق) والسمنة واضطرابات الكوليسترول وهشاشة العظام والاختلالات الهرمونية (الغدة النخامية، الكظرية، الهرمونات الجنسية). وبالمغرب، يتزايد داء السكري وأمراض الغدة الدرقية بقوة، ما يجعل طبيب الغدد الصمّاء فاعلًا أساسيًّا في الوقاية من المضاعفات (القلب، الكلى، العينان، الأعصاب). ويعتمد على التحاليل البيولوجية (السكر، HbA1c، الحصيلة الهرمونية) والتصوير بالصدى للغدة الدرقية ومرافقة نمط العيش لتحقيق توازن دائم لهذه الأمراض المزمنة.",
    quandConsulter: [
      "داء السكري: اكتشاف أو اختلال أو متابعة",
      "اضطرابات الغدة الدرقية (تعب، تغيّر الوزن، عقيدة)",
      "زيادة الوزن أو السمنة أو المتلازمة الاستقلابية",
      "ارتفاع الكوليسترول أو الدهون الثلاثية",
      "اضطرابات هرمونية (النمو، البلوغ، الدورة، الشعرانية)",
    ],
    faqs: [
      { q: "متى تستشير طبيب غدد صمّاء؟", a: "تُستشار الغدد الصمّاء بشأن داء السكري (كشف، اختلال أو متابعة)، أو اضطراب في الغدة الدرقية، أو سمنة، أو ارتفاع الكوليسترول، أو اختلال هرموني. وغالبًا ما يوجّه الطبيب العام، لكن الاستشارة المباشرة ممكنة." },
      { q: "كم تكلّف استشارة طبيب غدد صمّاء بالمغرب؟", a: "تتراوح الاستشارة عمومًا بين 250 و500 درهم حسب المدينة والممارس. وتُفوتَر التحاليل (السكر، HbA1c، الحصيلة الهرمونية) والتصوير بالصدى على حدة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "طبيب غدد صمّاء أم طبيب سكري: ما الفرق؟", a: "طبيب السكري هو طبيب غدد صمّاء متخصّص خاصة في السكري. وبالمغرب، يمارس معظم الأطباء تخصص الغدد الصمّاء والسكري ويتكفّلون في آن واحد بالسكري والغدة الدرقية وسائر الأمراض الهرمونية." },
      { q: "كيف أحجز موعدًا مع طبيب غدد صمّاء بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الغدد الصمّاء والأمراض الاستقلابية » ومدينتك لإيجاد ممارس متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "كيف أستعد لأول استشارة عند طبيب الغدد الصماء؟", a: "أحضر تحاليل الدم الأخيرة (السكر، الخضاب السكري HbA1c، تقييم الغدة الدرقية، الكوليسترول)، وقائمة الأدوية التي تتناولها، وتقارير التصوير إن وُجدت (صدى الغدة الدرقية، IRM). دوّن الأعراض ومدة ظهورها والسوابق العائلية. لا تأتِ صائمًا إلا إذا كان هناك تحليل دم مبرمج في نفس اليوم، وهو ما يمكن أن يوضحه لك مكتب الاستقبال عند حجز الموعد." },
      { q: "هل الاستشارة والفحوص في طب الغدد الصماء مُعوَّضة بالمغرب؟", a: "في القطاع الخاص تكون الأتعاب حرة، وتُعوَّض جزئيًا عبر التأمين الإجباري AMO (CNSS أو CNOPS) وفق التعريفة الوطنية المرجعية لوكالة ANAM بعد أداء المصاريف مسبقًا. أما في القطاع العام (المراكز الاستشفائية الجامعية والمستشفيات) فالتكفل أكثر يُسرًا، خاصة عبر AMO Tadamon. كثير من الفحوص الهرمونية والتصوير قد تُغطى جزئيًا، لكن يُستحسن التحقق من النسب مع هيئتك والاحتفاظ بجميع الفواتير." },
      { q: "هل يعالج طبيب الغدد الصماء أيضًا الغدد الكظرية والغدة النخامية؟", a: "نعم، يتكفل طبيب الغدد الصماء بمجموع الغدد الهرمونية، ومنها الكظرية (القصور الكظري، فرط الكورتيزول، فرط الألدوستيرون) والنخامية (الأورام الحميدة، اضطرابات البرولاكتين أو النمو أو الجزء الخلفي للنخامى). هذه الأمراض الأكثر ندرة تستلزم غالبًا معايرات هرمونية متخصصة وتصويرًا مخصصًا. ويُنسَّق التكفل عادةً مع طبيب الأشعة، وعند الحاجة مع جراح الأعصاب." },
      { q: "ما هو معدل مراقبة الخضاب السكري HbA1c عند مريض السكري؟", a: "كقاعدة عامة، يُراقَب الخضاب السكري (HbA1c) كل 3 أشهر ما دام التوازن غير محقق، ثم كل 6 أشهر عندما تستقر الأهداف. يُكيّف طبيب الغدد الصماء هذا الإيقاع حسب علاجك ونوع السكري ووجود مضاعفات محتملة. يعكس هذا التحليل متوسط مستويات السكر خلال الشهرين إلى الثلاثة الأخيرة ويوجّه تعديلات العلاج." },
      { q: "هل يتابع طبيب الغدد الصماء أيضًا الأطفال والمراهقين؟", a: "بعض أطباء الغدد الصماء لهم توجه في طب الأطفال ويتابعون اضطرابات النمو والبلوغ وسكري الطفل ومشاكل الغدة الدرقية. بالمغرب، غالبًا ما يُقدَّم هذا التكفل في مصالح الغدد الصماء للأطفال بالمراكز الاستشفائية الجامعية. بالنسبة لطفل، يُنصح بتوضيح سبب الزيارة لمكتب الاستقبال حتى يتم توجيهك نحو طبيب مختص في طب الأطفال." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "السكري · الغدة الدرقية", label: "أكثر الأسباب شيوعًا" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "داء السكري: التوازن والوقاية من المضاعفات",
        body: [
          "يتزايد داء السكري بقوة بالمغرب، ويتميّز بارتفاع السكر في الدم الذي يُتلف بصمت — إن لم يُضبَط جيدًا — القلب والكلى والعينين والأعصاب. وتهدف المتابعة إلى الحفاظ على توازن سكري جيد.",
          "يعتمد طبيب الغدد الصمّاء على HbA1c (ذاكرة السكر على ثلاثة أشهر)، ويعدّل العلاج (أقراص، أنسولين)، وينسّق كشف المضاعفات. ويبقى التثقيف حول نمط العيش — التغذية والنشاط البدني — في صلب التكفّل.",
        ],
      },
      {
        h: "أمراض الغدة الدرقية: قصور، فرط نشاط، عقيدات",
        body: [
          "تنظّم الغدة الدرقية الاستقلاب. ويسبّب تباطؤها (القصور) تعبًا وبرودة وزيادة في الوزن؛ ويؤدّي فرط نشاطها إلى عصبية وخفقان ونقص في الوزن. والعقيدات شائعة وحميدة في الغالب.",
          "يؤكّد طبيب الغدد الصمّاء التشخيص عبر قياس هرموني (TSH) وتصوير بالصدى، ثم يقترح علاجًا مناسبًا ويراقب العقيدات لاستبعاد أي تطوّر مشبوه.",
        ],
      },
      {
        h: "السمنة والكوليسترول والمتلازمة الاستقلابية",
        body: [
          "غالبًا ما تشكّل زيادة الوزن وارتفاع الضغط وفرط الكوليسترول والسكر متلازمة استقلابية تزيد الخطر القلبي الوعائي. والتكفّل الشامل أنجع من علاج كل عامل على حدة.",
          "يرافق طبيب الغدد الصمّاء فقدان الوزن، ويصحّح اختلالات الكوليسترول، ويعمل على نمط العيش، بالتنسيق مع الطبيب المعالج وعند الحاجة أخصائي التغذية.",
        ],
      },
      {
        h: "السكري والحمل، الهرمونات والحياة اليومية",
        body: [
          "تتطلّب بعض الحالات متابعة هرمونية دقيقة: سكري الحمل، اضطرابات البلوغ أو الدورة، الشعرانية المفرطة، هشاشة العظام بعد سنّ اليأس.",
          "ويتيح رأي مبكر في الغدد الصمّاء تفادي المضاعفات وتكييف العلاج مع كل مرحلة من مراحل الحياة.",
        ],
      },
      {
        h: "هشاشة العظام والكالسيوم ونقص فيتامين D",
        body: [
          "يتكفّل طبيب الغدد الصماء باضطرابات استقلاب الكالسيوم والفوسفور، ومنها هشاشة العظام، واختلالات الكالسيوم والغدة جار الدرقية (فرط نشاط جارات الدرق)، ونقص فيتامين D الشائع بالمغرب حتى لدى المعرّضين للشمس، خصوصًا في حالة تغطية الجلد أو الحياة داخل المنازل أو بعد سن معينة. يجمع التقييم بين تحاليل الدم، وأحيانًا قياس كثافة العظام (قياس الكثافة العظمية)، وتقدير عوامل خطر الكسور.",
          "يرتكز التكفل أولًا على تدابير بسيطة: توفير كمية كافية من الكالسيوم عبر التغذية، وتصحيح نقص فيتامين D، ونشاط بدني ملائم، والوقاية من السقوط. وقد يُقترح علاج دوائي حسب خطر الكسر، خاصة بعد سن اليأس أو عند وجود سوابق كسور. تتيح المتابعة المنتظمة تعديل المكمّلات والتحقق من التحمّل.",
        ],
      },
      {
        h: "الاضطرابات الهرمونية للإنجاب ومتلازمة تكيّس المبايض",
        body: [
          "يتدخل طبيب الغدد الصماء كذلك في الاختلالات الهرمونية التي تمسّ الخصوبة والحياة الإنجابية: متلازمة تكيّس المبايض (SOPK)، وزيادة الشعر (الشعرانية)، واضطرابات الدورة الشهرية، وفرط البرولاكتين، أو انخفاض التستوستيرون عند الرجل. هذه الحالات، الشائعة في الاستشارة بالمغرب، تترافق غالبًا مع انعكاس استقلابي (زيادة الوزن، مقاومة الأنسولين) يبرّر تقييمًا شاملًا.",
          "تجمع المقاربة بين الاستجواب والفحص السريري والمعايرات الهرمونية الموجّهة، وعند الحاجة تصويرًا بالصدى. يكون التكفل فرديًا: تدابير نمط العيش، وعلاج الأعراض المزعجة، والتنسيق مع طبيب النساء أو المسالك البولية عند وجود مشروع حمل أو عقم. الهدف هو تحسين الأعراض مع الحد من المخاطر الاستقلابية على المدى الطويل.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب غدد صمّاء بالمغرب؟",
      intro:
        "أتعاب الاستشارة حرّة؛ وتُفوتَر التحاليل والتصوير بالصدى على حدة. فيما يلي فئات إرشادية.",
      rows: [
        { label: "الاستشارة", value: "250 – 500 درهم" },
        { label: "تحليل الدم (السكر، HbA1c)", value: "100 – 350 درهم" },
        { label: "حصيلة هرمونية (الغدة الدرقية…)", value: "200 – 600 درهم" },
        { label: "تصوير بالصدى للغدة الدرقية", value: "300 – 600 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },
  "rhumatologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الروماتيزم هو الطبيب المختص في أمراض الجهاز الحركي: المفاصل والعظام والعضلات والأوتار والعمود الفقري. يشخّص ويعالج الفصال العظمي (الأرثروز) والروماتيزمات الالتهابية (التهاب المفاصل الروماتويدي، التهاب الفقار اللاصق) والنقرس وهشاشة العظام وآلام أسفل الظهر والآلام المفصلية المزمنة. وخلافًا لجرّاح العظام الذي يُجري العمليات، يتكفّل طبيب الروماتيزم بهذه الأمراض طبيًّا: أدوية، حقن موضعية، إعادة تأهيل. وبالمغرب، تُعدّ الآلام المفصلية وآلام الظهر من أكثر أسباب الاستشارة شيوعًا، ويكتسب الكشف عن هشاشة العظام أهمية بعد سنّ اليأس. ويعتمد طبيب الروماتيزم على الفحص السريري والتحاليل والتصوير (الأشعة، التصوير بالصدى، قياس كثافة العظام) لوضع تشخيص دقيق وتفادي التطوّر نحو الإعاقة.",
    quandConsulter: [
      "آلام مفصلية مستمرة أو تورّمات",
      "ألم مزمن في الظهر أو أسفل الظهر أو عرق النسا",
      "روماتيزم التهابي (تيبّس صباحي، مفاصل ساخنة)",
      "نوبة نقرس (إصبع قدم أحمر ومؤلم جدًّا)",
      "الكشف عن هشاشة العظام بعد سنّ اليأس",
    ],
    faqs: [
      { q: "ما الفرق بين طبيب الروماتيزم وجرّاح العظام؟", a: "يعالج طبيب الروماتيزم أمراض المفاصل والعظام طبيًّا (الأرثروز، الروماتيزمات الالتهابية، هشاشة العظام) عبر الأدوية والحقن الموضعية والمتابعة. أما جرّاح العظام فهو جرّاح يُجري عمليات الرضوض والمفاصل المتضرّرة بشدّة. والمقاربتان متكاملتان." },
      { q: "كم تكلّف استشارة طبيب روماتيزم بالمغرب؟", a: "تتراوح الاستشارة عمومًا بين 250 و500 درهم حسب المدينة والممارس. وتُفوتَر الفحوص (الأشعة، التصوير بالصدى، قياس كثافة العظام، تحاليل الدم) على حدة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "ما هي الحقنة الموضعية وهل هي مؤلمة؟", a: "تتمثّل الحقنة الموضعية في حقن مضادّ للالتهاب مباشرة داخل المفصل المؤلم أو حوله (الركبة، الكتف، العمود). وتُجرى تحت تخدير موضعي، وهي قليلة الألم وغالبًا ما تخفّف الأرثروز أو التهابًا موضعيًّا بشكل دائم." },
      { q: "كيف أحجز موعدًا مع طبيب روماتيزم بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الروماتيزم » ومدينتك لإيجاد ممارس متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "هل يُسترجع ثمن الحقنة أو العلاج عند طبيب الروماتيزم في المغرب؟", a: "تُسترجع جزئياً استشارات وأعمال طبيب الروماتيزم عبر التأمين الإجباري عن المرض AMO (CNSS أو CNOPS) وفق التعريفة الوطنية المرجعية (TNR) الصادرة عن ANAM، على أساس تعريفة اتفاقية غالباً أقل من الأتعاب الحقيقية في القطاع الخاص. يبقى جزء على عاتقك. قد تُغطى الأدوية الموصوفة والترويض الطبي وبعض العلاجات البيولوجية، أحياناً بعد موافقة مسبقة من هيئتك. احتفظ بأوراق العلاج والوصفات للاسترجاع." },
      { q: "كيف أستعد لأول استشارة عند طبيب الروماتيزم؟", a: "أحضر جميع فحوصاتك السابقة: الصور الإشعاعية، التصوير بالرنين المغناطيسي IRM، السكانير، التحاليل الدموية والتقارير. دوّن مكان الألم ومدته وإيقاعه (صباحاً، ليلاً، عند الجهد) ولائحة أدويتك. تساعد هذه المعلومات على التشخيص وتجنّب إعادة الفحوصات. إذا كانت آلامك صباحية أساساً مع تصلّب مطوّل، فأشر إلى ذلك: فهذا يوجّه نحو روماتيزم التهابي." },
      { q: "هل تلزم رسالة من الطبيب المعالج لاستشارة طبيب الروماتيزم؟", a: "في المغرب يمكنك استشارة طبيب الروماتيزم مباشرة في القطاع الخاص دون رسالة توجيه. أما في القطاع العام (المستشفى الجامعي، المستشفى) فيتم الولوج عادةً بعد المرور على طبيب عام أو استشارة فرز. تبقى رسالة الطبيب المعالج مفيدة لأنها تنقل تاريخك المرضي وعلاجاتك الجارية، مما يوفّر الوقت على الأخصائي." },
      { q: "هل داء النقرس من اختصاص طبيب الروماتيزم في المغرب؟", a: "نعم. النقرس، المرتبط بارتفاع حمض البول، يسبّب نوبات مفصلية مؤلمة جداً غالباً في إبهام القدم، وهو من الأسباب المتكررة للاستشارة في الروماتيزم بالمغرب. يؤكّد طبيب الروماتيزم التشخيص، ويعالج النوبة، ويضع علاجاً أساسياً لتفادي النكس مع نصائح غذائية. في حال مفصل أحمر وساخن فجأة مع حمّى، استشر بسرعة لاستبعاد عدوى." },
      { q: "ما الفحوصات التي قد يصفها طبيب الروماتيزم؟", a: "حسب الحالة، يصف طبيب الروماتيزم تحاليل دموية (سرعة الترسّب، CRP، العامل الروماتويدي، حمض البول)، صوراً إشعاعية، تصويراً صوتياً للمفصل، أو IRM، أو قياس كثافة العظم لكشف هشاشة العظام. تُنجز هذه الفحوصات في مختبرات الأشعة أو البيولوجيا، العامة أو الخاصة. بعضها يُسترجع جزئياً عبر AMO؛ وبالنسبة لـ IRM والسكانير قد تُطلب موافقة مسبقة أو تسبيق للمصاريف في القطاع الخاص." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "المفاصل والعظام", label: "مجال التخصص" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الأرثروز: تخفيف الألم والحفاظ على المفاصل",
        body: [
          "يستهلك الأرثروز تدريجيًّا غضروف المفاصل (الركبة، الورك، اليدان، العمود) ويسبّب ألمًا وتيبّسًا، خاصة مع التقدّم في السن أو زيادة الوزن أو بعد رضّ. وهو أكثر أنواع الروماتيزم شيوعًا.",
          "يخفّف طبيب الروماتيزم الألم، ويقترح إعادة تأهيل وحقنًا موضعية وتدابير للحفاظ على الحركة. ويبطّئ التكفّل المبكر التطوّر ويؤخّر الجراحة أو يتفاداها.",
        ],
      },
      {
        h: "الروماتيزمات الالتهابية: التهاب المفاصل الروماتويدي والفقار اللاصق",
        body: [
          "خلافًا للأرثروز الميكانيكي، تتجلّى الروماتيزمات الالتهابية (التهاب المفاصل الروماتويدي، التهاب الفقار اللاصق) في تيبّس صباحي مطوّل ومفاصل متورّمة وساخنة، وأحيانًا إصابة العمود، وقد تظهر لدى الشباب.",
          "والتشخيص المبكر حاسم: تتحكّم العلاجات الأساسية الحالية (ومنها العلاجات البيولوجية) في المرض وتتفادى التشوّهات والإعاقة. وكل ألم مفصلي التهابي مستمر يستدعي رأيًا سريعًا.",
        ],
      },
      {
        h: "ألم الظهر وأسفل الظهر وعرق النسا",
        body: [
          "ألم الظهر من أكثر أسباب الاستشارة شيوعًا. ومعظم آلام أسفل الظهر حميدة وميكانيكية، لكن بعضها يخفي سببًا التهابيًّا أو انزلاقًا غضروفيًّا يضغط على عصب (عرق النسا).",
          "يميّز طبيب الروماتيزم هذه الأسباب، ويخفّف الألم، ويصف إعادة التأهيل المناسبة. ويفرض ألمٌ ليلي أو حُمّى أو نقص في الوزن أو عجز عصبي إجراء حصيلة دون انتظار.",
        ],
      },
      {
        h: "هشاشة العظام: الكشف بعد سنّ اليأس",
        body: [
          "تُضعِف هشاشة العظام العظامَ بصمت وتعرّض للكسور (المعصم، الفقرات، الورك)، خاصة لدى المرأة بعد سنّ اليأس. ولا تسبّب أي عرض قبل أول كسر.",
          "يقيس قياس كثافة العظام صلابة العظم ويوجّه الوقاية (الكالسيوم، فيتامين D، النشاط البدني) وعند الحاجة علاجًا. ويُنصح بالكشف بعد 65 سنة أو أبكر عند وجود عوامل خطر.",
        ],
      },
      {
        h: "روماتيزم الطفل والرياضي",
        body: [
          "لا تخصّ الروماتيزم كبار السن فقط. فعند الطفل قد تكشف بعض الآلام المفصلية المستمرة أو العرج أو التورّم عن التهاب مفصلي يفعاني يتطلّب تكفّلاً مختصاً مبكراً. وعند المراهق والشاب البالغ، ينبغي أن تدفع آلام الظهر أو الكعب المستمرة والمتفاقمة ليلاً إلى التفكير في التهاب الفقار الروماتويدي، الذي كثيراً ما يُشخَّص متأخراً بالمغرب بعد سنوات.",
          "أما لدى الرياضي، هاوياً كان أو محترفاً، فيتكفّل طبيب الروماتيزم بالتهابات الأوتار وآلام الركبة أو الكتف أو الورك المرتبطة بالممارسة، وكذا مضاعفات الرضوض الدقيقة المتكررة. ويعمل بالتنسيق مع أخصائي الترويض، وعند الحاجة مع طبيب الرياضة أو جرّاح العظام. الهدف هو علاج الألم، تصحيح الحركات والمعدّات، وإتاحة استئناف تدريجي دون تفاقم الإصابة.",
        ],
      },
      {
        h: "التعايش مع مرض روماتيزمي مزمن في المغرب",
        body: [
          "تتطوّر العديد من أمراض الروماتيزم على المدى الطويل وتتطلّب متابعة منتظمة بدل علاج ظرفي. يكيّف طبيب الروماتيزم العلاجات عبر الزمن، ويراقب تحمّلها بفحوصات، وينسّق المسار مع الطبيب المعالج وأخصائي الترويض وأحياناً مختصين آخرين. وبالنسبة للأمراض الالتهابية التي تستلزم علاجات بيولوجية، غالباً ما تكون المتابعة القريبة وملف التكفّل لدى هيئة تأمينك (CNSS، CNOPS) أمراً لا غنى عنه.",
          "في الحياة اليومية، يؤدّي النشاط البدني الملائم، والتحكّم في الوزن، والإقلاع عن التدخين، وتكييف حركات العمل والمنزل دوراً كبيراً في الحدّ من الآلام والحفاظ على الاستقلالية. لا توقف أبداً علاجاً أساسياً دون رأي طبي، حتى وإن اختفت الآلام. وفي حال نوبة حادّة أو حمّى غير مفسَّرة أو مفصل ملتهب فجأة، اتصل بطبيب الروماتيزم أو، عند الطوارئ، بالرقم 15 (النجدة الطبية SAMU).",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى طبيب روماتيزم بالمغرب؟",
      intro:
        "أتعاب الاستشارة حرّة؛ وتُفوتَر الفحوص على حدة. فيما يلي فئات إرشادية.",
      rows: [
        { label: "الاستشارة", value: "250 – 500 درهم" },
        { label: "الأشعة", value: "150 – 350 درهم" },
        { label: "قياس كثافة العظام (هشاشة العظام)", value: "300 – 700 درهم" },
        { label: "حقنة موضعية للمفصل", value: "300 – 800 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },
  "traumatologie-orthopedie": {
    reviewed: "2026-07-05",
    description:
      "جرّاح العظام هو المختص في الجهاز الحركي: العظام والمفاصل والأوتار والأربطة والعضلات. يتكفّل بالكسور والالتواءات والفصال العظمي (الأرثروز) والانزلاق الغضروفي والجنف والأمراض التنكّسية المفصلية. وتشمل جراحة العظام تركيب مفاصل اصطناعية للورك والركبة، وجراحة العمود الفقري، وتنظير المفاصل. وبالمغرب، تجعل الإصابات المرتبطة بحوادث السير جراحة العظام من أكثر التخصصات طلبًا.",
    quandConsulter: [
      "آلام مفصلية مستمرة (الركبة، الورك، الكتف)",
      "كسر أو رضّ عظمي",
      "التواء خطير أو تمزّق رباطي",
      "انزلاق غضروفي أو ألم أسفل الظهر المزمن",
      "تشوّه مفصلي أو اضطراب في المشي",
    ],
    faqs: [
      { q: "ما الفرق بين طبيب الروماتيزم وجرّاح العظام؟", a: "يعالج طبيب الروماتيزم الأمراض الالتهابية المفصلية (التهاب المفاصل، النقرس) بشكل طبي. أما جرّاح العظام فيتدخل جراحيًا في الأمراض الميكانيكية ورضوض الجهاز الحركي." },
      { q: "كم تكلّف استشارة لدى جرّاح العظام بالمغرب؟", a: "تكلّف استشارة جراحة العظام بين 300 و600 درهم بالمغرب. وتخضع الأعمال الجراحية لتكفّل استشفائي منفصل." },
      { q: "متى يجب استشارة جرّاح العظام بشكل عاجل؟", a: "استشِر بشكل عاجل في حالة الاشتباه في كسر، أو تشوّه مفصلي مفاجئ، أو ألم شديد بعد سقوط، أو إذا لم يعد المفصل قادرًا على تحمّل الوزن." },
      { q: "كيف أحجز موعدًا مع جرّاح العظام؟", a: "على صحة بالمغرب، جِد جرّاح عظام متاحًا في مدينتك واحجز عبر الإنترنت. وللطوارئ الرضّية، توجّه مباشرة إلى مستعجلات المستشفى." },
      { q: "هل يلزم الحصول على رسالة توجيه من الطبيب المعالج لاستشارة طبيب العظام؟", a: "في المغرب، يمكنكم عمومًا استشارة طبيب العظام مباشرة في القطاع الخاص دون المرور عبر طبيب معالج. أما في القطاع العام، فإن المرور عبر المركز الصحي أو المستعجلات غالبًا ما يوجه نحو الاستشارة التخصصية. للاستفادة من تعويض AMO، احتفظوا بجميع الوثائق والوصفات الطبية." },
      { q: "العظام والرياضة: متى يجب استشارة الطبيب بعد إصابة رياضية؟", a: "استشيروا طبيب العظام إذا استمر التواء أو تمزق عضلي أو ألم مفصلي أكثر من بضعة أيام رغم الراحة والثلج والتثبيت. إن استحالة وضع القدم على الأرض أو عدم استقرار المفصل أو التورم الكبير تستدعي استشارة سريعة. في حالة رضح عنيف مصحوب بتشوه، توجهوا إلى المستعجلات (15 SAMU)." },
      { q: "كيف نستعد لعملية جراحية عظمية مبرمجة؟", a: "يُطلب إجراء فحص ما قبل الجراحة: تحاليل الدم والفحص القلبي واستشارة التخدير أمور معتادة. أبلغوا عن جميع أدويتكم، خصوصًا مضادات التخثر التي غالبًا ما تُعدَّل قبل العملية. نظّموا مسبقًا عودتكم إلى المنزل والمعدات الممكنة (عكازات، جبيرة) لتسهيل فترة النقاهة." },
      { q: "هل تتكفل CNSS أو AMO بالجراحة العظمية؟", a: "تتكفل AMO (CNSS أو القطاع العام) جزئيًا بالتدخلات العظمية المعترف بها حسب التعريفة الوطنية المرجعية لـ ANAM. يشمل التعويض قاعدة اتفاقية، وغالبًا ما يبقى مبلغ على عاتق المريض في القطاع الخاص حيث الأتعاب حرة. اطلبوا فاتورة تقديرية مفصلة وتحققوا من تغطيتكم التكميلية قبل الاستشفاء." },
      { q: "كم تدوم إعادة التأهيل بعد عملية الكتف أو الركبة؟", a: "تتوقف إعادة التأهيل على نوع التدخل وحالتكم، وتمتد عمومًا من بضعة أسابيع إلى عدة أشهر. تُعد حصص العلاج الطبيعي، التي يصفها طبيب العظام، أساسية لاستعادة الحركة والقوة. إن احترام البروتوكول والمواظبة على الحصص يحددان إلى حد كبير جودة النتيجة النهائية." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "العظام والمفاصل", label: "مجال التخصص" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الكسور والرضوض: ماذا تفعل؟",
        body: [
          "بالمغرب، تجعل حوادث السير والسقطات الرضوض العظمية سببًا متكررًا جدًّا. وأمام تشوّه أو ألم شديد أو استحالة تحريك طرف بعد صدمة، توجّه إلى المستعجلات.",
          "ثم يتولّى جرّاح العظام الالتئام: جبس أو جبيرة أو جراحة حسب الكسر، ثم متابعة إعادة التأهيل حتى التعافي.",
        ],
      },
      {
        h: "الفصال العظمي والآلام المفصلية المزمنة",
        body: [
          "يستهلك الفصال العظمي (الأرثروز) غضروف المفاصل تدريجيًّا (الركبة، الورك، الكتف) ويسبّب آلامًا وتيبّسًا، خاصة مع التقدّم في السن أو بعد رضّ.",
          "ويقيّم جرّاح العظام المرحلة، ويقترح علاجات تحفّظية (إعادة تأهيل، حقن)، وحين تصبح الإعاقة معيقة، يدرس الجراحة.",
        ],
      },
      {
        h: "مفاصل اصطناعية للورك والركبة",
        body: [
          "حين يكون الفصال متقدّمًا والإعاقة كبيرة، يعيد تركيب مفصل اصطناعي للورك أو الركبة حركةً دون ألم. وهي جراحة متكررة ومُتقَنة بالمغرب.",
          "ويتبع التدخّل إعادة تأهيل أساسية للتعافي. ويقيّم جرّاح العظام الوقت المناسب حسب الألم وأثره على الحياة اليومية.",
        ],
      },
      {
        h: "طبيب الروماتيزم أم جرّاح العظام: من تستشير؟",
        body: [
          "يعالج طبيب الروماتيزم طبيًّا الأمراض الالتهابية المفصلية (التهاب المفاصل، النقرس). أما جرّاح العظام فيتدخّل في الأمراض الميكانيكية والرضوض، مع إمكان اللجوء إلى الجراحة.",
          "وعند الشك، يوجّه الطبيب العام إلى الأخصائي المناسب. ويبرّر ألم مفصلي مستمر دائمًا رأيًا لتفادي التفاقم.",
        ],
      },
      {
        h: "المتابعة بعد العملية وإعادة التأهيل عقب الجراحة العظمية",
        body: [
          "بعد التدخل الجراحي العظمي، لا تتوقف المتابعة عند الخروج من غرفة العمليات. يبرمج طبيب العظام استشارات مراقبة لمتابعة التئام الجرح، والتحقق من الالتحام العظمي السليم عبر الأشعة، وضبط علاج الألم. إن احترام التعليمات المتعلقة بالاعتماد على العضو والتثبيت بالجبيرة أو استعمال العكازات أمر حاسم لتجنب المضاعفات. في المغرب، تُنظَّم هذه المتابعة في القطاع الخاص كما في المستشفيات العمومية، حسب تغطيتكم ومكان إجراء العملية.",
          "تُعد إعادة التأهيل، الموكولة إلى أخصائي العلاج الطبيعي بناءً على وصفة طبيب العظام، مرحلة قائمة بذاتها في الشفاء. وتهدف إلى استعادة مدى الحركة وتقوية العضلات واسترجاع الاستقلالية في حركات الحياة اليومية. إن المواظبة على الحصص وممارسة التمارين في المنزل تؤثران بقوة في النتيجة النهائية. فالمرافقة الجيدة تقلل من خطر تيبس المفاصل وتسرّع العودة إلى الأنشطة المعتادة.",
        ],
      },
      {
        h: "طب العظام لدى الأطفال: متابعة نمو الطفل",
        body: [
          "يهتم طب العظام لدى الأطفال باضطرابات الجهاز الحركي عند الطفل، والتي يرتبط كثير منها بالنمو. تشمل أسباب الاستشارة الشائعة في المغرب المشي على رؤوس الأصابع، والأقدام المسطحة، والساقين المقوّستين أو على شكل حرف X، إضافة إلى الكشف عن الجَنَف في مرحلة المراهقة. بعض هذه الجوانب فيزيولوجية وتُصحَّح تلقائيًا مع التقدم في السن، بينما يتطلب بعضها الآخر مراقبة دقيقة أو علاجًا.",
          "يتيح الكشف المبكر تفادي تفاقم بعض التشوهات بعد انتهاء النمو. فالخلع الولادي للورك، مثلًا، يُبحث عنه منذ الأشهر الأولى من الحياة لأن التكفل المبكر به يكون أبسط بكثير. في حال الشك في وضعية طفلكم أو مشيته أو وجود عدم تناسق في الظهر، تتيح الاستشارة العظمية وضع تشخيص، وعند الحاجة، التوجيه نحو متابعة ملائمة أو نحو العلاج الطبيعي.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى جرّاح العظام بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص والجراحة على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "300 – 600 درهم" },
        { label: "تصوير بالأشعة", value: "150 – 350 درهم" },
        { label: "حقن مفصلي", value: "300 – 800 درهم" },
        { label: "مفصل اصطناعي للورك أو الركبة (عيادة)", value: "25 000 – 60 000 درهم" },
      ],
      note: "أسعار إرشادية (2026)، خارج التكفّل. يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للأعمال بملف.",
    },
  },
  "psychiatrie": {
    reviewed: "2026-07-05",
    description:
      "الطبيب النفسي هو الطبيب المختص في الاضطرابات النفسية والسلوكية. يشخّص ويعالج الاكتئاب واضطرابات القلق والاضطراب ثنائي القطب والفصام والإدمان واضطرابات الشخصية. وبصفته طبيبًا، يمكنه وصف الأدوية (مضادات الاكتئاب، مزيلات القلق، مضادات الذهان) ويقترح أيضًا علاجات نفسية. وبالمغرب، تبقى الصحة النفسية مجالًا غير ممثَّل بما يكفي رغم طلب متزايد — واستشارة طبيب نفسي عمل شجاع ومفيد.",
    quandConsulter: [
      "اكتئاب أو حزن عميق أو فقدان للمعنى",
      "قلق حاد أو نوبات هلع",
      "اضطرابات نوم مستمرة",
      "سلوكات إدمانية (الكحول، المواد، المقامرة)",
      "أفكار اقتحامية أو سلوكات متكررة",
    ],
    faqs: [
      { q: "ما الفرق بين الطبيب النفسي والأخصائي النفسي؟", a: "الطبيب النفسي طبيب يمكنه وصف الأدوية إضافة إلى العلاجات. أما الأخصائي النفسي، غير الطبيب، فيركّز على العلاجات السلوكية والمعرفية دون وصف طبي." },
      { q: "كم تكلّف استشارة لدى الطبيب النفسي بالمغرب؟", a: "تكلّف الجلسة لدى الطبيب النفسي بين 300 و600 درهم بالمغرب. وتسترجع CNSS وAMO جزئيًا الاستشارات النفسية بوصفة." },
      { q: "هل الاستشارة النفسية سرّية؟", a: "نعم، السرية الطبية مضمونة. ولا تُبلَّغ المعلومات المتبادَلة مع طبيبك النفسي لأي كان دون موافقتك، إلا في حالة طارئة قانونية." },
      { q: "كيف أجد طبيبًا نفسيًا بالمغرب؟", a: "تُدرج صحة بالمغرب الأطباء النفسيين المتاحين مع آرائهم وأسعارهم. وحجز الموعد سرّي ومجاني عبر الإنترنت." },
      { q: "هل يلزم وصفة طبية أو رسالة من الطبيب المعالج لاستشارة طبيب نفسي في المغرب؟", a: "لا، يمكن الوصول إلى الطبيب النفسي مباشرة في المغرب: يمكنك استشارته دون المرور عبر طبيب عام. تبقى رسالة التوجيه مفيدة إذا كان طبيبك المعالج يتابع وضعك بالفعل، لأنها تسهّل نقل سوابقك الصحية. لأول موعد، يكفي التواصل مع العيادة." },
      { q: "هل تُعوَّض الأدوية النفسية (مضادات الاكتئاب، مضادات القلق) من طرف CNSS أو AMO؟", a: "يوجد جزء من الأدوية النفسية ضمن لوائح الأدوية القابلة للتعويض في إطار AMO، على أساس التعريفة المرجعية التي تحددها ANAM. يفترض التعويض وجود وصفة واحترام المسار المعتاد (ورقة العلاجات أو صيدلية متعاقدة). تبقى بعض الجزيئات الحديثة على نفقتك: اسأل الطبيب النفسي والصيدلي عمّا هو مشمول في حالتك." },
      { q: "هل تسبب مضادات الاكتئاب الإدمان وهل يمكن التوقف عنها بمفردك؟", a: "لا تسبب مضادات الاكتئاب إدماناً بمعنى المخدرات، لكن التوقف المفاجئ قد يؤدي إلى أعراض انسحاب مزعجة. يجب ألا تتوقف عنها بمفردك أبداً: يتم التخفيض تدريجياً وفق جدول يُقرَّر مع الطبيب النفسي. أما مضادات القلق من عائلة البنزوديازيبينات فتعرّض للتعوّد وتُوصف لمدد قصيرة." },
      { q: "ماذا تفعل عند حدوث أزمة أو أفكار انتحارية خارج أوقات العيادة؟", a: "أمام خطر مباشر عليك أو على الغير، اتصل دون انتظار بالرقم 15 (SAMU) أو توجّه إلى مستعجلات أقرب مستشفى، فهي تتوفر على تكفّل نفسي. لا تنتظر الموعد القادم. يمكنك أيضاً الاتصال بشخص مقرّب موثوق كي لا تبقى وحيداً ريثما تحصل على المساعدة." },
      { q: "هل يمكن للطبيب النفسي تحرير شهادة لعطلة مرضية أو لملف إداري؟", a: "نعم، يمكن للطبيب النفسي تسليم شهادة طبية أو عطلة مرضية عندما تبرّر الحالة الصحية ذلك، وهي مقبولة لدى المشغّل و CNSS. بالنسبة للحالات المعقّدة (العجز، ملف لدى هيئة ما)، يمكنه تحرير تقرير مفصّل. حدّد الاستعمال المتوقّع منذ الاستشارة كي تكون الوثيقة ملائمة." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الجلسة" },
      { value: "طبيب", label: "يمكنه وصف علاج" },
      { value: "سرّي", label: "السرّ الطبي مضمون" },
    ],
    sections: [
      {
        h: "الطبيب النفسي أم الأخصائي النفسي: ما الفرق؟",
        body: [
          "الطبيب النفسي طبيب: يشخّص الاضطرابات النفسية ويمكنه وصف أدوية، إضافة إلى اقتراح علاجات نفسية. أما الأخصائي النفسي، غير الطبيب، فيركّز على المرافقة والعلاجات دون وصف.",
          "وكلاهما مكمّل للآخر. ويتوقّف الاختيار على الحالة؛ وعند الشك، يوجّه الطبيب العام إلى المهني الأنسب.",
        ],
      },
      {
        h: "الاكتئاب واضطرابات القلق: أمراض تُعالَج",
        body: [
          "الاكتئاب واضطرابات القلق ليسا ضعفًا في الشخصية بل أمراضًا حقيقية، شائعة ومُتكفَّل بها جيدًا اليوم.",
          "حزن عميق دائم، فقدان الاهتمام، اضطرابات نوم، قلق غامر أو أفكار سوداء، كلها تستدعي الاستشارة. وكلما كان التكفّل مبكرًا، كان التعافي أفضل.",
        ],
      },
      {
        h: "رفع الطابو عن الصحة النفسية بالمغرب",
        body: [
          "تبقى الصحة النفسية محاطة بالطابوهات بالمغرب، بينما يتزايد الطلب على العلاج. واستشارة طبيب نفسي عمل علاجي مسؤول، شأنه شأن أي مرض آخر.",
          "ويتفادى طلب المساعدة باكرًا التفاقم والإزمان. ولا ينبغي لأحد أن يعاني في صمت خوفًا من نظرة الآخرين.",
        ],
      },
      {
        h: "السرية وسير الاستشارة",
        body: [
          "الاستشارة النفسية سرّية بصرامة: المعلومات المتبادَلة محمية بالسرّ الطبي ولا تُبلَّغ لأحد دون موافقتك.",
          "وتهدف الجلسة الأولى إلى فهم وضعك. ثم يقترح الطبيب النفسي متابعة مناسبة: علاج نفسي، دواء، أو كلاهما، شارحًا لك كل مرحلة.",
        ],
      },
      {
        h: "متى تستشير طبيباً نفسياً: العلامات التي يجب أن تنبّهك",
        body: [
          "بعض العلامات تستدعي أخذ موعد دون انتظار: حزن أو قلق يدوم عدة أسابيع، اضطرابات نوم مستمرة، فقدان الاهتمام بالأنشطة المعتادة، عصبية غير معتادة، أو صعوبة في أداء العمل والحياة اليومية. لدى بعض الأشخاص تظهر الأعراض أولاً عبر الجسد: تعب غير مفسّر، خفقان، آلام منتشرة أو اضطرابات هضمية لا تجد لها الفحوص سبباً. غالباً ما تتيح الاستشارة المبكرة علاجاً أقصر وأكثر فعالية.",
          "يجب ألا يُستهان أبداً بأفكار الموت، أو استهلاك متزايد للكحول أو المواد، أو أفكار تبدو منفصلة عن الواقع، أو سلوك يقلق المحيطين. في حالة الخطر المباشر، يتكفّل الرقم 15 (SAMU) ومستعجلات المستشفيات على مدار الساعة. أما في الحالات غير المستعجلة، فيمكن لطبيب نفسي مُدرَج على SantéauMaroc وضع تشخيص واقتراح تكفّل ملائم، بمفرده أو بالتنسيق مع أخصائي نفسي والطبيب المعالج.",
        ],
      },
      {
        h: "العلاجات النفسية في المغرب: القطاع العام والقطاع الخاص",
        body: [
          "في المغرب، يتوزّع التكفّل بالصحة النفسية بين قطاع عام (المراكز الاستشفائية الجامعية، المستشفيات الجهوية والمصالح النفسية المتخصصة) وقطاع خاص من العيادات والمصحّات. يبقى القطاع العام الطريق الرئيسي للاستشفاء والحالات الثقيلة، بتكاليف محدودة لكن أحياناً بآجال انتظار. أما القطاع الخاص فيوفّر مواعيد أسرع ومتابعة قريبة، بأتعاب حرّة تختلف حسب المدينة وخبرة الممارس.",
          "يعتمد الاختيار على طبيعة الاضطراب ودرجة الاستعجال وتغطيتك الصحية. يمكن للمنخرطين في CNSS أو AMO الحصول على تعويض جزئي عن الاستشارات وبعض الأدوية، وفق التعريفة المرجعية لـ ANAM. يجمع كثير من المرضى بين المسارين: متابعة منتظمة في عيادة خاصة واللجوء إلى المستشفى العمومي عند الأزمة. يساعدك SantéauMaroc على تحديد الأطباء النفسيين القريبين منك ومقارنة أوقات التوفر واللغات المتحدَّث بها والتعاقد.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة لدى الطبيب النفسي بالمغرب؟",
      intro: "الأتعاب حرّة وتختلف حسب المدينة والممارس ومدة الجلسة. فئات أسعار إرشادية.",
      rows: [
        { label: "الاستشارة الأولى", value: "350 – 700 درهم" },
        { label: "جلسة متابعة", value: "300 – 600 درهم" },
        { label: "استشارة في عيادة خاصة", value: "400 – 800 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للاستشارات النفسية بوصفة.",
    },
  },

  "chirurgie-dentaire": {
    reviewed: "2026-07-05",
    description:
      "جرّاح الأسنان هو المختص في صحة الفم والأسنان. يشخّص ويعالج التسوّس وأمراض اللثة (التهاب اللثة، التهاب دواعم السن) والعدوى السنية واضطرابات الإطباق. ويشمل مجاله العلاجات الجارية — تنظيف الجير، علاج التسوّس، سحب العصب — وكذلك الأعمال التعويضية والجراحية: التيجان، الجسور، الأطقم، القلع وزرع الأسنان. وبالمغرب، تبقى صحة الأسنان سببًا متكررًا جدًّا للاستشارة، وعرض العيادات كثيف في المدن الكبرى. وتتيح زيارة مراقبة مرة إلى مرتين سنويًّا، مصحوبة بتنظيف الجير، الوقاية من غالبية الأمراض وتفادي علاجات ثقيلة ومكلفة. كما يقوم جرّاح الأسنان بدور الكشف المبكر: يرصد آفات الغشاء المخاطي للفم مبكرًا ويوجّه إلى أخصائي عند الحاجة. وبالنسبة للأطفال، تواكب المتابعة المنتظمة نموّ الأسنان وتقي من تسوّس الصغر.",
    quandConsulter: [
      "ألم في الأسنان أو حساسية للحار أو البارد",
      "نزيف أو تورّم في اللثة",
      "مراقبة سنوية وتنظيف الجير",
      "سن مكسورة أو متخلخلة أو خرّاج",
      "حاجة إلى طقم أو تاج أو زرعة",
    ],
    faqs: [
      { q: "ما وتيرة استشارة جرّاح الأسنان؟", a: "يُنصح بزيارة مراقبة كل 6 إلى 12 شهرًا، حتى دون ألم، للكشف المبكر عن التسوّس وأمراض اللثة. ويُنصح بتنظيف الجير سنويًّا لمعظم البالغين." },
      { q: "كم تكلّف استشارة طبيب الأسنان بالمغرب؟", a: "تكلّف الاستشارة البسيطة عمومًا بين 100 و250 درهمًا، وتنظيف الجير بين 200 و500 درهم، وعلاج التسوّس بين 150 و400 درهم حسب المدينة والعيادة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي عند تقديم الوصفة." },
      { q: "هل يُتلف تنظيف الجير الأسنان؟", a: "لا، يزيل تنظيف الجير اللويحة والجير دون الإضرار بالمينا. وهو عمل وقائي يحمي اللثة ويتفادى تخلخل الأسنان. وقد تظهر حساسية خفيفة وعابرة في الأيام التالية." },
      { q: "كيف أحجز موعدًا مع طبيب أسنان بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « جراحة الأسنان » واختر مدينتك. اطّلع على الملفات الموثوقة وآراء المرضى والمواعيد المتاحة، ثم احجز عبر الإنترنت مجانًا." },
      { q: "هل خلع ضرس العقل ضروري دائماً؟", a: "لا، يمكن الإبقاء على ضرس العقل الذي وجد مكانه ولا يسبب ألماً ولا التهاباً ولا إزعاجاً للأسنان المجاورة مع المتابعة. ويُلجأ إلى الخلع عندما يكون الضرس منطمراً أو في وضع خاطئ أو مصدراً للتسوس أو لالتهابات متكررة (التهاب حوائط التاج). يعتمد جراح الأسنان على الفحص السريري وصورة بانورامية لاتخاذ القرار، وقد يحيلك أحياناً إلى طبيب تخصص جراحة الفم بالمغرب في الحالات المعقدة." },
      { q: "ماذا أفعل عند نوبة ألم الأسنان أو خُراج سني؟", a: "يستوجب الألم السني الشديد أو تورم الوجه استشارة طبيب الأسنان بسرعة، لأنه قد يكون خُراجاً يجب علاجه دون تأخير. وفي انتظار ذلك، قد يخفف مسكّن بسيط الألم لكنه لا يغني عن العلاج. وإذا امتد التورم إلى الرقبة أو أعاق التنفس أو البلع أو رافقته حمى مرتفعة، وجب التوجه إلى المستعجلات أو الاتصال بالرقم 15 (SAMU)، فالعدوى السنية المهملة قد تتعقد." },
      { q: "هل يمكن لطبيب الأسنان أن يعالج المرأة الحامل؟", a: "نعم، العلاجات السنية المعتادة ممكنة أثناء الحمل بل يُنصح بها، لأن اللثة تكون أكثر هشاشة في هذه الفترة. وغالباً ما يكون الثلث الثاني من الحمل هو الأنسب للعلاجات المبرمجة. ومن المهم إخبار جراح الأسنان بالحمل ليكيّف المخدّر ويتجنب بعض الأدوية ويؤجل الأشعة غير المستعجلة." },
      { q: "هل تقويم الأسنان مخصص للأطفال فقط؟", a: "لا، يمكن إجراء علاج تقويم الأسنان (جهاز التقويم) في أي عمر ما دامت اللثة والعظم سليمين، ويلجأ إليه كثير من البالغين بالمغرب. ومع ذلك يُنصح بأول فحص تقويمي للطفل نحو سن السابعة لاكتشاف اختلال الفكين في الوقت المناسب. وحسب درجة التعقيد، قد يحيلك جراح الأسنان إلى أخصائي تقويم الأسنان." },
      { q: "كيف أحافظ على نفَس منعش يومياً؟", a: "تنتج رائحة الفم الكريهة في الغالب عن ترسّب بكتيري على الأسنان واللسان أو عن لثة ملتهبة، وغالباً ما يكفي تنظيف الأسنان بعناية مرتين يومياً وتنظيف اللسان واستعمال الخيط السني لتحسينها. كما يساعد التقليح المنتظم ومعالجة التسوس. وإذا استمرت الرائحة مزعجة رغم النظافة الجيدة، فإن الاستشارة تتيح البحث عن السبب، الذي قد يكون هضمياً أو أنفياً أذنياً حنجرياً." },
    ],
    essentiel: [
      { value: "100 – 250 درهم", label: "ثمن الاستشارة" },
      { value: "1 إلى 2 سنويًّا", label: "زيارات المراقبة المنصوح بها" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "العلاجات السنية الجارية: تنظيف الجير والتسوّس وسحب العصب",
        body: [
          "غالبية الأعمال المنجزة في العيادة هي علاجات جارية: تنظيف الجير لإزالة اللويحة، وعلاج التسوّس بالحشو، وسحب العصب حين يبلغ التسوّس العصب. وإذا عولجت في حينها، تكون هذه العلاجات بسيطة وقليلة الكلفة.",
          "وإذا أُهملت، تتطوّر نحو الخرّاج وفقدان السن وعلاجات أثقل. وتبقى المراقبة المنتظمة أفضل حماية، خاصة لمرضى السكري الذين تكثر لديهم عدوى اللثة.",
        ],
      },
      {
        h: "الأطقم والتيجان وزرع الأسنان",
        body: [
          "حين تكون السن متضرّرة جدًّا أو مفقودة، يقترح جرّاح الأسنان حلًّا تعويضيًّا: تاج لإعادة بناء سن مسحوبة العصب، جسر أو طقم متحرّك لتعويض عدة أسنان، أو زرعة مثبَّتة في العظم لحلّ دائم.",
          "ويتوقّف الاختيار على حالة الفك وعدد الأسنان الواجب تعويضها والميزانية. وتتطلّب زراعة الأسنان فحصًا مسبقًا (صورة بالأشعة، أحيانًا سكانير) للتأكد من جودة العظم.",
        ],
      },
      {
        h: "علاج أسنان الطفل",
        body: [
          "تبدأ متابعة أسنان الطفل منذ ظهور الأسنان الأولى. يراقب الطبيب النموّ، ويضع طلاءً بالفلور، ويعالج مبكرًا تسوّس الأسنان اللبنية الذي قد يؤثّر على الأسنان الدائمة.",
          "كما يرصد اضطرابات الإطباق ويوجّه، عند الاقتضاء، إلى أخصائي تقويم الأسنان لعلاج المحاذاة في الوقت المناسب.",
        ],
      },
      {
        h: "استرجاع مصاريف علاج الأسنان: CNSS وAMO",
        body: [
          "تُسترجَع جزئيًّا علاجات الأسنان الأساسية وبعض الأطقم من طرف CNSS وAMO، عند تقديم ورقة العلاجات والفاتورة التقديرية. أما الأعمال التجميلية (التبييض، الوجوه الخزفية) فلا تُسترجَع عمومًا.",
          "اطلب دائمًا فاتورة تقديرية مفصّلة قبل أي علاج تعويضي أو زراعة: فهي ضرورية لملف الاسترجاع ولمقارنة العيادات.",
        ],
      },
      {
        h: "الوقاية من مشاكل الأسنان: النظافة والتغذية",
        body: [
          "يمكن تجنب الغالبية العظمى من مشاكل الأسنان الشائعة بالمغرب، من تسوس وأمراض لثة، عبر ممارسات بسيطة ومنتظمة. فتنظيف الأسنان لمدة دقيقتين صباحاً ومساءً بمعجون يحتوي على الفلور، مع استعمال الخيط السني أو الفُرَيْشات لتنظيف ما بين الأسنان، يزيل الطبقة البكتيرية المسؤولة عن التسوس والتهاب اللثة. كما أن تغيير الفرشاة كل ثلاثة أشهر تقريباً والتنظيف اللطيف يحافظان على الأسنان واللثة معاً.",
          "وتؤدي التغذية دوراً حاسماً: فتكرار تناول السكر، أكثر من كميته، يشجع على التسوس، خصوصاً عبر المشروبات المحلاة والتنقيل بين الوجبات. ويُعد شرب الماء والحد من الشاي شديد التحلية ومضمضة الفم بعد تناول طعام حمضي عادات واقية. كما تتيح زيارة مراقبة منتظمة لدى جراح الأسنان الكشف المبكر عن آفة في بدايتها وتفادي علاجات أثقل وأكثر كلفة لاحقاً.",
        ],
      },
      {
        h: "التغلب على الخوف من طبيب الأسنان وعيش الموعد بطمأنينة",
        body: [
          "الخوف من طبيب الأسنان أمر شائع ولا ينبغي أن يؤدي إلى تأجيل العلاج، لأن المشكلة المهملة غالباً ما تصبح أكثر إيلاماً وأصعب علاجاً. والتحدث بصراحة إلى الطبيب يغيّر الكثير: إذ يمكن لجراح الأسنان أن يشرح كل مرحلة، وأن يتفق معك على إشارة لأخذ استراحة، وأن يقترح تخديراً موضعياً فعالاً حتى تكون العلاجات غير مؤلمة. كما يساعد اختيار موعد في وقت هادئ من اليوم على خوض الجلسة بمزيد من الاسترخاء.",
          "ويسهم الاستعداد الجيد في موعد مطمئن: فتدوين الأسئلة والمضايقات مسبقاً، وإحضار لائحة العلاجات الجارية، والإشارة إلى أي حساسية أو مرض مزمن، يتيح للطبيب تكييف رعايته. وبعد بعض العلاجات، تساعد احتياطات بسيطة، مثل تجنب الأكل ما دام أثر التخدير لم يزُل، على تعافٍ جيد. وعند حدوث ألم غير معتاد أو نزيف مطوّل بعد تدخل، لا ينبغي التردد في معاودة الاتصال بجراح الأسنان.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف علاجات الأسنان بالمغرب؟",
      intro: "الأتعاب حرّة بالمغرب وتختلف حسب المدينة والعيادة وتعقيد العمل. وفيما يلي فئات أسعار إرشادية مُلاحَظة.",
      rows: [
        { label: "استشارة بسيطة", value: "100 – 250 درهم" },
        { label: "تنظيف الجير", value: "200 – 500 درهم" },
        { label: "علاج تسوّس", value: "150 – 400 درهم" },
        { label: "سحب العصب (علاج العصب)", value: "400 – 1 200 درهم" },
        { label: "تاج خزفي", value: "1 500 – 3 500 درهم" },
        { label: "زرع سن", value: "5 000 – 12 000 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للعلاجات الأساسية عند تقديم الوصفة والفاتورة التقديرية.",
    },
  },

  "chirurgie-generale": {
    reviewed: "2026-07-05",
    description:
      "جرّاح الجهاز الهضمي العام (الجرّاح الحشوي والهضمي) يتكفّل جراحيًّا بأمراض البطن والأنسجة الرخوة. يعالج التهاب الزائدة الدودية، والفتوق (الإربي، السُّري)، وحصى وأمراض المرارة، وأمراض الأنبوب الهضمي، إضافة إلى عدد من طوارئ البطن. وتفضّل الجراحة الحديثة بالمغرب التقنيات قليلة التوغّل (التنظير البطني) التي تقلّل الألم ومدة الاستشفاء. وتأتي استشارة الجراحة العامة غالبًا بعد توجيه من الطبيب العام أو طبيب الجهاز الهضمي أو المستعجلات، عقب فحص (صدى، سكانير، تحاليل). ويقيّم الجرّاح دواعي العملية، ويشرح العمل الجراحي وفوائده ومخاطره، وينظّم الاستشارة قبل التخدير الإلزامية قبل أي تدخّل مبرمَج. كما يتكفّل بالمتابعة بعد العملية والتئام الجرح. وأمام ألم بطني حاد وشديد، تفرض استشارة سريعة لاستبعاد طارئ جراحي.",
    quandConsulter: [
      "فتق في المغبن أو البطن",
      "نوبات مغص كبدي (حصى المرارة)",
      "ألم بطني حاد (اشتباه في التهاب الزائدة)",
      "فحص قبل تدخّل جراحي",
      "متابعة ما بعد العملية والتئام الجرح",
    ],
    faqs: [
      { q: "متى يجب استشارة جرّاح عام؟", a: "تُجرى الاستشارة عمومًا بتوجيه من الطبيب المعالج أو طبيب الجهاز الهضمي أو المستعجلات، حين يستلزم مرض ما رأيًا جراحيًّا: فتق، حصى المرارة، التهاب الزائدة أو أي مرض آخر بالبطن." },
      { q: "كم تكلّف استشارة الجراحة العامة بالمغرب؟", a: "تكلّف الاستشارة عمومًا بين 250 و500 درهم حسب المدينة والممارس. وتتوقّف كلفة التدخّل على نوع العمل والعيادة ومدة الاستشفاء؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من تكفّل جزئي بملف." },
      { q: "ما هو التنظير البطني (الكويلوسكوبي)؟", a: "التنظير البطني تقنية قليلة التوغّل: يعمل الجرّاح عبر شقوق صغيرة بواسطة كاميرا. وتقلّل الألم والندوب ومدة الاستشفاء مقارنة بالجراحة المفتوحة، حين تكون مُستطبَّة." },
      { q: "كيف أحجز موعدًا مع جرّاح بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الجراحة العامة » ومدينتك لإيجاد جرّاح متاح، والاطّلاع على آراء المرضى الموثوقة، وحجز استشارة عبر الإنترنت مجانًا." },
      { q: "ما الفرق بين الجرّاح العام وجرّاح الأحشاء أو الجهاز الهضمي؟", a: "في المغرب، يتكفّل الجرّاح العام بمجموعة واسعة من العمليات المتعلقة بجدار البطن وأعضاء الجهاز الهضمي (الفتق، المرارة، الزائدة الدودية، الغدة الدرقية، الثدي). أما جرّاح الأحشاء والجهاز الهضمي فهو أخصّائي دقيق يركّز على أعضاء الأنبوب الهضمي وسرطانات الجهاز الهضمي المعقّدة. بالنسبة لمشكل بسيط يكفي الجرّاح العام، بينما توجَّه الحالات الثقيلة غالباً إلى مركز يتوفّر على تجهيزات متخصّصة." },
      { q: "هل يلزم إحضار رسالة توجيه من الطبيب المعالج لرؤية الجرّاح؟", a: "لا، في القطاع الخاص بالمغرب يمكنك استشارة جرّاح عام مباشرة دون رسالة. غير أنّ إحضار رسالة من طبيبك العام وفحوصاتك الحديثة (تصوير بالصدى، سكانير، تحليل دم) يوفّر الوقت ويتجنّب تكرار الفحوصات. في القطاع العام، يكون المرور عبر مركز صحّي أو مصلحة المستعجلات هو عادةً باب الولوج." },
      { q: "كم تدوم فترة المكوث بالمستشفى بعد عملية شائعة؟", a: "يتوقّف ذلك على نوع العملية والتقنية المستعملة. غالباً ما يتمّ علاج الفتق أو استئصال المرارة بالمنظار في نفس اليوم أو بمبيت ليلة واحدة بالعيادة. أما الجراحة المفتوحة أو الأثقل فقد تتطلّب عدّة أيام. يحدّد لك جرّاحك المدّة المتوقّعة أثناء الاستشارة، غير أنها قد تُمدَّد في حال وجود مضاعفات خاصة." },
      { q: "متى يمكنني استئناف العمل والرياضة بعد التدخّل الجراحي؟", a: "بعد منظار بسيط، يكون استئناف نشاط خفيف ممكناً غالباً خلال أسبوع إلى أسبوعين، بينما يجب تجنّب حمل الأثقال والرياضة عدّة أسابيع. بعد الجراحة المفتوحة تكون فترة النقاهة أطول. التزم بدقّة بتعليمات جرّاحك، فالاستئناف المبكّر جداً يزيد من خطر مضاعفات مثل الفتق الجراحي (الانبثاق)." },
      { q: "ماذا أفعل عند ظهور حمّى أو احمرار أو إفرازات على مستوى الجرح بعد العملية؟", a: "قد تدلّ هذه العلامات على التهاب الجرح وتستوجب الاتصال بسرعة بجرّاحك أو بالعيادة التي أُجريت فيها العملية. في حال حمّى مرتفعة أو ألم شديد بالبطن أو تقيّؤ أو إغماء، فالأمر يتعلّق بحالة مستعجلة: توجّه إلى المستعجلات أو اتّصل بالرقم 15 (SAMU). لا تنتظر ولا تغيّر علاجك بمفردك." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "التنظير البطني", label: "تقنيات قليلة التوغّل" },
      { value: "بتوجيه", label: "بعد فحص طبي" },
    ],
    sections: [
      {
        h: "الفتوق والمرارة والزائدة: أكثر التدخّلات شيوعًا",
        body: [
          "أكثر أسباب الجراحة العامة شيوعًا هي علاج الفتق (تقوية الجدار، غالبًا بشبكة)، واستئصال المرارة عند وجود حصى مصحوبة بأعراض، واستئصال الزائدة الدودية في حالة طارئة.",
          "وتُنجَز معظم هذه التدخّلات اليوم بالتنظير البطني بالمغرب، ما يتيح تعافيًا أسرع وعودة مبكرة إلى الأنشطة.",
        ],
      },
      {
        h: "قبل العملية: الفحص والاستشارة قبل التخدير",
        body: [
          "يسبق كلَّ تدخّل مبرمَج فحصٌ (تحاليل، تصوير) واستشارةٌ إلزامية قبل التخدير مع طبيب التخدير والإنعاش، الذي يقيّم الخطر ويختار نوع التخدير.",
          "ويشرح الجرّاح سير العملية وفوائدها ومخاطرها والعواقب المتوقَّعة. وهي اللحظة المناسبة لطرح كل أسئلتك والحصول على فاتورة تقديرية مفصّلة.",
        ],
      },
      {
        h: "كيف تتعرّف على طارئ جراحي بطني",
        body: [
          "قد يدلّ ألم بطني شديد ومفاجئ، خاصة إذا صاحبته حمى أو تقيّؤ أو بطن متصلّب أو انقطاع الغازات والبراز، على حالة طارئة (التهاب الزائدة، انسداد، التهاب الصفاق).",
          "في هذه الحالة، لا تتأخّر: توجّه إلى مستعجلات المستشفى. فالتشخيص والتكفّل السريعان يحدّان من المضاعفات.",
        ],
      },
      {
        h: "التكفّل واسترجاع مصاريف التدخّل",
        body: [
          "تجمع كلفة التدخّل أتعاب الجرّاح وأتعاب طبيب التخدير ومصاريف العيادة (قاعة العمليات، الاستشفاء). وتختلف كثيرًا حسب المؤسسة وتعقيد العمل.",
          "ويستفيد المؤمَّنون لدى CNSS وAMO من تكفّل جزئي، يُكوَّن قبل الاستشفاء انطلاقًا من الفاتورة التقديرية والتقارير. تحقّق من الشروط لدى مؤسستك وتعاضديتك التكميلية.",
        ],
      },
      {
        h: "الجراحة في نفس اليوم والمنظار: نحو فترات مكوث أقصر",
        body: [
          "يتمّ في المغرب إجراء عدد متزايد من عمليات الجراحة العامة في نفس اليوم، أي بالدخول والخروج في اليوم ذاته دون المبيت بالعيادة. هذا التنظيم، الذي أصبح ممكناً بفضل التقنيات القليلة التوغّل مثل المنظار، يشمل خصوصاً بعض عمليات الفتق واستئصال المرارة لدى مرضى في حالة صحّية جيدة. وهو يقلّص مدّة الملازمة للفراش وخطر العدوى المرتبط بالمكوث الطويل.",
          "لا يُقترَح خيار نفس اليوم إلا إذا سمحت بذلك حالتك الصحّية ومحيطك ومكان إقامتك: يجب أن يكون بإمكانك العودة مرافَقاً، ومراقَباً في الليلة الأولى، والاتصال بسهولة بالفريق الطبي عند وجود مشكل. يقيّم الجرّاح وطبيب التخدير معاً مدى أهليتك أثناء الاستشارة. وفي حال وجود شكّ، يبقى المكوث التقليدي بالمستشفى هو المفضّل دائماً من أجل سلامتك.",
        ],
      },
      {
        h: "بعد العملية: التئام الجرح والألم والعلامات التي يجب مراقبتها",
        body: [
          "الفترة التي تلي التدخّل لا تقلّ أهمية عن العمل الجراحي نفسه. يسلّمك جرّاحك تعليمات حول العناية بالجرح، واستئناف التغذية، والتحرّك المبكّر، وعلاج الألم. من الطبيعي الشعور بانزعاج متوسّط في الأيام الأولى، على أن يتراجع تدريجياً. ويتيح احترام مواعيد المراقبة التأكّد من حسن التئام الجرح وتعديل العلاج عند الحاجة.",
          "هناك علامات يجب أن تنبّهك وتدفعك إلى الاتصال بالفريق الطبي دون انتظار: الحمّى، أو الاحمرار، أو التورّم، أو الإفرازات على مستوى الجرح، أو ألم يشتدّ، أو بطن قاسٍ ومؤلم، أو تقيّؤ، أو تعذّر التبوّل أو التبرّز. وفي حال ظهور علامات خطورة (ألم شديد، إغماء، صعوبة في التنفّس)، يجب التوجّه إلى المستعجلات أو الاتصال بالرقم 15 (SAMU) دون تأخير.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف الجراحة العامة بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتتوقّف كلفة التدخّل على نوع العمل والعيادة ومدة الاستشفاء. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "250 – 500 درهم" },
        { label: "استشارة قبل التخدير", value: "200 – 400 درهم" },
        { label: "علاج الفتق (عيادة خاصة)", value: "8 000 – 20 000 درهم" },
        { label: "استئصال المرارة (تنظير بطني)", value: "12 000 – 30 000 درهم" },
      ],
      note: "أسعار إرشادية (2026)، خارج التكفّل. يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للأعمال الجراحية بملف.",
    },
  },
  "optique": {
    description:
      "أخصائي البصريات هو المهني الصحي الذي يصمّم ويصنع ويضبط المعدات البصرية — النظارات والعدسات اللاصقة — انطلاقًا من الوصفة التي يسلّمها طبيب العيون. وهو ليس طبيبًا: لا يشخّص أمراض العين، بل يصحّح عيوب الإبصار (قصر النظر، طول النظر، اللابؤرية، قصوّ البصر الشيخوخي) حسب الوصفة. وبالمغرب، تكثر محلات البصريات ويؤدّي أخصائي البصريات دورًا مهمًّا في المرافقة: اختيار الإطار، نوع العدسات (أحادية البؤرة، متعددة البؤر، مضادة للانعكاس، فلتر الضوء الأزرق)، أخذ القياسات والتركيب والضبط. كما يُجري فحوص نظر للراحة ويوجّه إلى طبيب العيون عند تغيّر التصحيح أو ظهور عرض غير معتاد. والتمييز بين أخصائي البصريات وطبيب العيون أساسي: تبقى الوصفة الطبية ضرورية للحصول على عدسات تصحيحية مناسبة ودائمة.",
    quandConsulter: [
      "تجديد النظارات بوصفة سارية",
      "اختيار إطار وعدسات مناسبة",
      "أول تكيّف مع العدسات اللاصقة",
      "نظارات مكسورة أو عدسات مخدوشة أو انزعاج",
      "فحص راحة بين زيارتين لطبيب العيون",
    ],
    faqs: [
      { q: "ما الفرق بين أخصائي البصريات وطبيب العيون؟", a: "طبيب العيون طبيب يفحص العينين ويشخّص أمراض العين ويصف التصحيح. أما أخصائي البصريات فيصنع ويضبط النظارات والعدسات حسب هذه الوصفة، لكنه لا يضع تشخيصًا طبيًّا." },
      { q: "كم تكلّف النظارات بالمغرب؟", a: "يتوقّف الثمن على الإطار والعدسات: احسب نحو 300 إلى 800 درهم للإطار، و200 إلى 600 درهم للعدسات أحادية البؤرة، و800 إلى 2 500 درهم للعدسات متعددة البؤر. وتسترجع بعض التعاضديات وAMO جزءًا من المعدات عند تقديم الوصفة." },
      { q: "هل تلزم وصفة لشراء النظارات؟", a: "نعم، تلزم وصفة حديثة من طبيب عيون للحصول على عدسات تصحيحية مناسبة. فبدون تصحيح طبي محدَّث، لا يمكن لأخصائي البصريات ضمان معدات مطابقة لاحتياجاتك البصرية." },
      { q: "كيف أجد أخصائي بصريات بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب « البصريات » ومدينتك لإيجاد أخصائي قريب، والاطّلاع على الآراء والتواصل عبر الإنترنت مجانًا." },
    ],
    essentiel: [
      { value: "بوصفة", label: "العدسات التصحيحية" },
      { value: "300 – 800 درهم", label: "ثمن الإطار" },
      { value: "≠ طبيب العيون", label: "أخصائي البصريات ليس طبيبًا" },
    ],
    sections: [
      {
        h: "متى تذهب إلى أخصائي البصريات بدل طبيب العيون؟",
        body: [
          "تذهب إلى أخصائي البصريات بعد الحصول على الوصفة: لاختيار النظارات وتركيبها، أو تجديد معدات بوصفة سارية، أو ضبط إطار. كما يُجري أخصائي البصريات فحوص راحة.",
          "في المقابل، أي انخفاض في الرؤية أو ألم أو احمرار أو عرض بصري يخصّ طبيب العيون، وهو وحده المؤهّل للتشخيص وتحديث التصحيح.",
        ],
      },
      {
        h: "حسن اختيار العدسات: أحادية البؤرة، متعددة البؤر والمعالجات",
        body: [
          "تصحّح العدسات أحادية البؤرة عيبًا واحدًا (قصر النظر، طول النظر)، بينما تصحّح العدسات متعددة البؤر الرؤية البعيدة والقريبة على عدسة واحدة، وهي مفيدة بعد قصوّ البصر الشيخوخي.",
          "وتحسّن معالجات إضافية الراحة: مضاد الانعكاس، الطبقة المضادة للخدش، فلتر الضوء الأزرق للشاشات، أو العدسات المتلوّنة التي تغمق في الشمس. ويرشدك أخصائي البصريات حسب نمط حياتك.",
        ],
      },
      {
        h: "العدسات اللاصقة: التكيّف والنظافة",
        body: [
          "يتطلّب أول استعمال للعدسات تكيّفًا: اختيار النوع (يومية، شهرية)، وتعلّم وضعها وقواعد النظافة لتفادي العدوى.",
          "واحترام مدة الارتداء والصيانة أساسي. وعند احمرار أو انزعاج مستمر، انزع العدسات واستشِر طبيب عيون.",
        ],
      },
      {
        h: "استرجاع مصاريف البصريات بالمغرب",
        body: [
          "تتكفّل AMO وعدة تعاضديات بجزء من المعدات البصرية (الإطار والعدسات)، عمومًا على فترات منتظمة (مثلًا كل سنتين للبالغين).",
          "احتفظ بالوصفة والفاتورة المفصّلة: فهما ضروريان للاسترجاع. وتختلف السقوف والشروط حسب نظامك وتعاضديتك التكميلية.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف المعدات البصرية بالمغرب؟",
      intro: "الأسعار حرّة وتتوقّف على الإطار ونوع العدسات والمعالجات المختارة. فئات أسعار إرشادية مُلاحَظة.",
      rows: [
        { label: "إطار", value: "300 – 800 درهم" },
        { label: "عدسات أحادية البؤرة (الزوج)", value: "200 – 600 درهم" },
        { label: "عدسات متعددة البؤر (الزوج)", value: "800 – 2 500 درهم" },
        { label: "عدسات لاصقة (علبة)", value: "150 – 400 درهم" },
        { label: "فحص نظر للراحة", value: "غالبًا مجاني عند الشراء" },
      ],
      note: "أسعار إرشادية (2026). تسترجع AMO والتعاضديات جزءًا من المعدات عند تقديم الوصفة والفاتورة.",
    },
  },

  "urologie-et-chirurgie-urologique": {
    reviewed: "2026-07-05",
    description:
      "طبيب المسالك البولية هو الطبيب المختص في الجهاز البولي لدى الرجل والمرأة (الكلى، الحالبان، المثانة، الإحليل) وفي الجهاز التناسلي الذكري (البروستات، الخصيتان). يشخّص ويعالج التهابات المسالك المتكررة، وحصى الكلى، واضطرابات التبوّل، والسلس البولي، وأمراض البروستات (الورم الحميد، التهاب البروستات، الكشف عن السرطان)، واضطرابات الخصوبة أو الانتصاب. وهو طبيب وجرّاح في آن: يُجري أعمالًا تنظيرية وجراحية، من علاج الحصى إلى جراحة البروستات. وبالمغرب، تُعدّ حصى المسالك واضطرابات البروستات لدى الرجل بعد سن 50 من الأسباب المتكررة للاستشارة. ويعتمد طبيب المسالك على فحوص موجّهة — صدى، تحاليل بول، قياس PSA، سكانير — لوضع تشخيص دقيق واقتراح علاج طبي أو تدخّلي مناسب.",
    quandConsulter: [
      "حرقة بولية أو التهابات بولية متكررة",
      "مغص كلوي (حصى الكلى)",
      "اضطرابات التبوّل أو إلحاح متكرر (البروستات)",
      "دم في البول",
      "اضطرابات الانتصاب أو الخصوبة لدى الرجل",
    ],
    faqs: [
      { q: "متى تُستشار طبيب المسالك البولية؟", a: "يُستشار طبيب المسالك عند تكرّر التهابات البول، أو الحصى، أو دم في البول، أو اضطرابات التبوّل، أو لمتابعة البروستات لدى الرجل بعد سن 50. والتوجيه من الطبيب العام شائع لكنه غير إلزامي." },
      { q: "كم تكلّف استشارة طبيب المسالك بالمغرب؟", a: "تكلّف الاستشارة عمومًا بين 300 و600 درهم حسب المدينة والممارس. وتخضع الفحوص (الصدى، قياس PSA) والأعمال الجراحية لمصاريف منفصلة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "ابتداءً من أي سن تُراقَب البروستات؟", a: "يُقترح الكشف عن اضطرابات البروستات لدى الرجل عمومًا ابتداءً من سن 50، أو أبكر (45 سنة) عند وجود سوابق عائلية لسرطان البروستات. ويجمع بين فحص سريري وقياس PSA في الدم." },
      { q: "كيف أحجز موعدًا مع طبيب المسالك بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « المسالك البولية » ومدينتك لإيجاد طبيب متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "كيف يجري التصوير بالصدى (الإيكوغرافيا) أو تنظير المثانة عند طبيب المسالك البولية؟", a: "التصوير بالصدى للمسالك البولية غير مؤلم ويُجرى في العيادة أو في مركز للتصوير دون تحضير معقد. أما تنظير المثانة، وهو فحص للمثانة بواسطة كاميرا مرنة صغيرة، فيُجرى تحت تخدير موضعي ويستغرق بضع دقائق ؛ قد يكون مزعجاً قليلاً لكنه محتمل جيداً. تسمح هذه الفحوص بالبحث عن الحصى أو الأورام الحميدة أو تشوهات جدار المثانة." },
      { q: "هل وجود دم في البول خطير دائماً؟", a: "رؤية دم في البول (بيلة دموية) ليست أبداً أمراً عادياً وتستدعي دائماً استشارة، حتى لو حدثت مرة واحدة واختفت. تتراوح الأسباب بين الالتهاب أو الحصى وصولاً إلى إصابات أخطر في المثانة أو الكلى يجب استبعادها. في حال نزيف غزير مع جلطات أو استحالة التبول، توجّه إلى المستعجلات أو اتصل بالرقم 15 (SAMU)." },
      { q: "هل يُعالَج سلس البول فعلاً؟", a: "نعم، سلس البول ليس قدراً محتوماً مرتبطاً بالسن ويُعالَج في الغالبية العظمى من الحالات. حسب النوع، يقترح طبيب المسالك البولية إعادة تأهيل للعضلات العجانية أو أدوية أو أجهزة أو جراحة. يستشير كثير من المرضى في المغرب متأخرين بسبب الحرج، في حين أن التكفّل المبكر يحسّن جودة الحياة بوضوح." },
      { q: "هل تُسترجَع مصاريف استشارة وفحوص المسالك البولية في المغرب؟", a: "يُغطّى جزء من علاجات المسالك البولية عبر التأمين الإجباري عن المرض AMO من خلال CNSS أو CNOPS، على أساس التعريفة المرجعية للوكالة ANAM (TNR). في القطاع الخاص، وبما أن الأتعاب حرة، غالباً ما يبقى مبلغ على عاتق المريض، خصوصاً في الجراحة. اطلب فاتورة تقديرية وورقة علاجات، وتحقّق من الموافقة المسبقة بالنسبة للأعمال الثقيلة أو الاستشفاء." },
      { q: "كيف نُحضّر جيداً أول استشارة عند طبيب المسالك البولية؟", a: "أحضِر تحاليل البول والدم الأخيرة، وتقارير التصوير بالصدى أو السكانير، ولائحة الأدوية التي تتناولها حالياً. دوّن أعراضك (وتيرة الرغبة في التبول، الحرقة، ضعف التدفق، الاستيقاظ ليلاً) ومنذ متى بدأت. بالنسبة لتحليل PSA، تجنّب الجهد على الدراجة أو العلاقة الجنسية خلال 48 ساعة قبل سحب الدم." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "ابتداءً من 50", label: "متابعة البروستات (الرجل)" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "حصى المسالك: التعرّف على المغص الكلوي وعلاجه",
        body: [
          "تسبّب حصى الكلى آلامًا قطنية شديدة (مغص كلوي) قد تمتدّ نحو أسفل البطن، مصحوبة أحيانًا بدم في البول. ويشجّع المناخ الحار وقلّة شرب الماء على تكوّنها بالمغرب.",
          "وحسب الحجم والموضع، يتراوح العلاج بين شرب الماء والمسكّنات والتفتيت بالموجات الصادمة أو التدخّل التنظيري. ويبقى شرب كمية كافية من الماء أفضل وقاية.",
        ],
      },
      {
        h: "صحة البروستات بعد سن 50",
        body: [
          "مع التقدّم في السن، يكبر حجم البروستات (ورم حميد) وقد يعيق التبوّل: ضعف التدفّق، إلحاح ليلي، إحساس بعدم إفراغ كامل. وتبرّر هذه الأعراض استشارة، وإن كانت غالبًا حميدة.",
          "كما تتيح المتابعة المنتظمة الكشف المبكر عن سرطان البروستات، وهو متكرر وحسن المآل عند اكتشافه باكرًا. ويكيّف طبيب المسالك المراقبة حسب سنّك وسوابقك.",
        ],
      },
      {
        h: "التهابات المسالك: متى نقلق؟",
        body: [
          "التهابات المسالك البسيطة متكررة، خاصة لدى المرأة، وتُعالَج بالمضادات الحيوية. لكن التهابات متكررة أو حمى أو آلام قطنية أو دم في البول تستدعي الاستشارة.",
          "ولدى الرجل، يستحق أي التهاب بولي رأيًا لأنه قد يكشف سببًا كامنًا (بروستات، حصى). ويبحث طبيب المسالك عن السبب ويعالجه، لا الأعراض فقط.",
        ],
      },
      {
        h: "اضطرابات الانتصاب والخصوبة لدى الرجل",
        body: [
          "يتكفّل طبيب المسالك أيضًا باضطرابات الانتصاب والخصوبة لدى الرجل. وهذه الأسباب، رغم كونها لا تزال من المحرّمات، شائعة وغالبًا ما تُعالَج جيدًا بعد تحديد السبب.",
          "ويبحث فحص عن العوامل المتدخّلة (وعائية، هرمونية، نفسية، مرتبطة بنمط الحياة أو ببعض الأدوية) ويوجّه نحو تكفّل مناسب. والاستشارة سرّية.",
        ],
      },
      {
        h: "سرطانات المسالك البولية: أهمية التشخيص المبكر",
        body: [
          "يتكفّل طبيب المسالك البولية بسرطانات البروستاتا والمثانة والكلية والخصية. تتطوّر كثير من هذه الأمراض مدة طويلة في صمت ؛ لذلك يجب ألا نتجاهل أبداً إشارات مثل وجود دم في البول أو انزعاج مستمر أو كتلة على مستوى الخصية. عند الرجل، يُعدّ الفحص الذاتي للخصيتين بعد الاستحمام واليقظة تجاه الاضطرابات البولية بعد سن الخمسين من ردود الفعل المفيدة.",
          "في المغرب، يجمع التكفّل بين طبيب المسالك البولية وطبيب الأورام وطبيب العلاج الإشعاعي، في القطاعين العام والخاص. يوسّع التشخيص المبكر خيارات العلاج، التي تكون غالباً أقل ثقلاً، ويحسّن المآل. أمام أي عرض غير معتاد ومستمر، من الأفضل الاستشارة دون انتظار بدل التأجيل خوفاً من النتيجة.",
        ],
      },
      {
        h: "الشرب والحركة والأكل: الوقاية من اضطرابات المسالك البولية يومياً",
        body: [
          "يبقى الترطيب الجيد، بكمية كافية من الماء موزّعة على مدار اليوم، أول إجراء وقائي ضد الحصى والالتهابات البولية، خصوصاً خلال موجات الحر الشديد في الصيف المغربي. كما أن التقليل من الملح، والاعتدال في الأطعمة الغنية جداً بالبروتينات الحيوانية، ومراقبة الوزن، يخفّض خطر عودة الحصى ويخفّف على المثانة.",
          "يحمي النشاط البدني المنتظم والإقلاع عن التدخين وانعدام أو الاعتدال الشديد في تناول الكحول المثانةَ ووظيفةَ الانتصاب. كما يساهم عدم حبس البول مدة طويلة، والذهاب إلى المرحاض بعد العلاقة الجنسية، ومعالجة الإمساك، في صحة المسالك البولية. تكمّل هذه العادات البسيطة نصائح ومتابعة طبيب المسالك البولية دون أن تعوّضها أبداً.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة طبيب المسالك بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص والأعمال الجراحية على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "300 – 600 درهم" },
        { label: "صدى الجهاز البولي", value: "300 – 600 درهم" },
        { label: "قياس PSA (تحليل)", value: "100 – 250 درهم" },
        { label: "تفتيت الحصى (جلسة)", value: "3 000 – 8 000 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },

  "orthodontie": {
    reviewed: "2026-07-05",
    description:
      "أخصائي تقويم الأسنان هو جرّاح الأسنان المتخصص في تصحيح وضعية الأسنان والفكّين. يشخّص ويعالج سوء اصطفاف الأسنان والتزاحم والفراغات وتباعد الفكّين، وهي مشكلات تؤثّر على جمالية الابتسامة والمضغ وأحيانًا النطق. ويعتمد العلاج على أجهزة — تقويم معدني أو خزفي، أو قوالب شفافة قابلة للنزع — تُرتدى من عدة أشهر إلى سنوات. وبعدما كان يُربط تاريخيًّا بالأطفال والمراهقين، أصبح تقويم الأسنان اليوم يهمّ أيضًا عددًا كبيرًا من البالغين بالمغرب، بفضل حلول أكثر تحفّظًا. ويتيح فحص مبكر لدى الطفل (نحو 7‑8 سنوات) رصد اضطرابات النمو والتدخّل في أفضل وقت. وإلى جانب الجمالية، ييسّر الاصطفاف الجيد نظافة الفم ويقي من التآكل ومشاكل اللثة على المدى البعيد.",
    quandConsulter: [
      "أسنان سيّئة الاصطفاف أو متزاحمة أو متباعدة",
      "تباعد الفكّين (الذقن إلى الأمام أو الخلف)",
      "فحص تقويمي للطفل (نحو 7‑8 سنوات)",
      "صعوبة في المضغ أو إغلاق الفم بشكل صحيح",
      "الرغبة في اصطفاف الأسنان في سنّ البلوغ",
    ],
    faqs: [
      { q: "في أي سن نبدأ علاج تقويم الأسنان؟", a: "يُنصح بفحص أول نحو 7‑8 سنوات لرصد اضطرابات النمو. ويبدأ العلاج الفعّال غالبًا في المراهقة، لكن تقويم الأسنان ممكن أيضًا في سنّ البلوغ، في أي سن، ما دامت اللثة سليمة." },
      { q: "كم يكلّف علاج تقويم الأسنان بالمغرب؟", a: "يكلّف العلاج الكامل عمومًا بين 8 000 و25 000 درهم حسب التقنية (تقويم أو قوالب شفافة) والمدة. ويُؤدّى غالبًا على أقساط شهرية؛ وقد يستفيد المؤمَّنون لدى CNSS أو AMO من تكفّل جزئي، خاصة للأطفال." },
      { q: "تقويم معدني أم قوالب شفافة: ماذا أختار؟", a: "يناسب التقويم المعدني جميع الحالات، بما فيها المعقّدة، وهو أكثر اقتصادًا. أما القوالب الشفافة القابلة للنزع فأكثر تحفّظًا وراحة، وتناسب الحالات الخفيفة إلى المتوسطة، لكنها تتطلّب ارتداءً صارمًا. ويوصي الأخصائي بالحلّ حسب وضعك." },
      { q: "كيف أجد أخصائي تقويم أسنان بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « تقويم الأسنان » ومدينتك لإيجاد أخصائي، والاطّلاع على آراء المرضى الموثوقة، وحجز موعد عبر الإنترنت مجانًا." },
      { q: "هل تُغطّي CNSS أو AMO تكاليف تقويم الأسنان في المغرب؟", a: "قد يتحمّل نظام AMO جزءاً من تكلفة تقويم الأسنان عند بدء العلاج قبل سنّ معيّنة لدى الطفل وبموافقة مسبقة من الهيئة (ANAM/CNSS أو CNOPS). يكون التعويض محدوداً بسقف لكل فترة علاج ولا يشمل أبداً الأعمال ذات الطابع الجمالي المحض لدى البالغين. اطلب من طبيب التقويم فاتورة تقديرية مفصّلة وموافقة مسبقة قبل بدء العلاج." },
      { q: "هل يجب خلع أسنان لتركيب جهاز تقويم الأسنان؟", a: "الخلع ليس أمراً تلقائياً: لا يُلجأ إليه إلا عند نقص كبير في المساحة يتعذّر تعويضه بطريقة أخرى. تُنجَز اليوم علاجات كثيرة دون خلع بفضل التوسيع أو إرجاع الأسنان. يقرّر طبيب التقويم ذلك بعد تحليل الصور الإشعاعية والبصمات." },
      { q: "هل يمكن لطبيب أسنان عام تركيب الأقواس، أم يلزم طبيب تقويم مختصّ؟", a: "تقويم الأسنان تخصّص معترف به يتطلّب تكويناً إضافياً بعد شهادة جراح الأسنان. يمكن لطبيب الأسنان العام إنجاز بعض الأعمال البسيطة، لكن العلاج الكامل بالأقواس أو الأجهزة الشفافة من اختصاص طبيب التقويم المختصّ. تحقّق من مؤهّل الممارس، خاصة في الحالات المعقّدة المتعلقة بالنمو أو الجراحة المشتركة." },
      { q: "ماذا أفعل عند انفكاك قوس أو سلك يجرح الفم؟", a: "انفكاك قوس أو سلك يوخز ليس حالة استعجالية خطيرة: ضع شمع التقويم على المنطقة المزعجة واتصل بعيادتك لتحديد موعد سريع. في انتظار ذلك، تجنّب الأطعمة الصلبة أو اللاصقة. لا تقطع السلك بنفسك أبداً دون رأي الممارس." },
      { q: "هل يمكن إجراء تقويم الأسنان أثناء الحمل؟", a: "يمكن عادةً متابعة علاج تقويم الأسنان أثناء الحمل لأنه لا يعتمد على الأدوية. غير أنّ الصور الإشعاعية تُؤجَّل أو تُنجَز مع مئزر واقٍ من الرصاص، وتتطلّب اللثة الأكثر حساسية في هذه الفترة عناية معزّزة. أخبري طبيب التقويم بحملك لتكييف المتابعة." },
    ],
    essentiel: [
      { value: "ابتداءً من 7‑8", label: "سنّ الفحص الأول" },
      { value: "8 000 – 25 000 درهم", label: "علاج كامل (إرشادي)" },
      { value: "أطفال وبالغون", label: "ممكن في أي سن" },
    ],
    sections: [
      {
        h: "تقويم أسنان الطفل: لماذا فحص مبكر؟",
        body: [
          "نحو 7‑8 سنوات، تتيح الأسنان الدائمة الأولى ونموّ الفكّين لأخصائي التقويم رصد اضطرابات قبل تفاقمها. وقد يوجّه تدخّل مبكر النموّ ويبسّط العلاج اللاحق.",
          "وليس كل الأطفال بحاجة إلى جهاز فوري: غالبًا ما يخدم الفحص المراقبة واختيار الوقت المناسب للتدخّل.",
        ],
      },
      {
        h: "تقويم أسنان البالغ: لم يفت الأوان أبدًا",
        body: [
          "يقبل عدد متزايد من البالغين على علاج تقويمي، لأسباب جمالية أو وظيفية. وقد أزالت الحلول المتحفّظة (القوالب الشفافة، التقويم الخزفي) عائقًا مهمًّا.",
          "ولدى البالغ، تُقيَّم حالة اللثة والعظم مسبقًا. وقد يدوم العلاج أطول قليلًا، لكن النتائج دائمة مع تثبيت جيد.",
        ],
      },
      {
        h: "التقويم والقوالب والتثبيت: كيف يعمل ذلك",
        body: [
          "تمارس الأجهزة قوى خفيفة ومستمرة تحرّك الأسنان تدريجيًّا نحو وضعها المستهدف. وتتيح مراقبات منتظمة ضبط العلاج.",
          "وفي النهاية، تكون مرحلة تثبيت (سلك ملصق أو قالب ليلي) ضرورية لتثبيت النتيجة وتفادي عودة الأسنان إلى وضعها الأصلي.",
        ],
      },
      {
        h: "النظافة ومدة العلاج",
        body: [
          "أثناء العلاج، تكون النظافة الصارمة أساسية، خاصة مع التقويم الذي يحتجز اللويحة: تنظيف دقيق وفُرَيشات ومراقبات منتظمة تتفادى التسوّس والبقع.",
          "وتتراوح المدة من أشهر لحالة خفيفة إلى سنتين‑ثلاث لحالة معقّدة. ويتوقّف النجاح على انتظام المواعيد واحترام التعليمات.",
        ],
      },
      {
        h: "الفحص التقويمي: الصور الإشعاعية والبصمات وخطة العلاج",
        body: [
          "قبل أيّ جهاز، يُجري طبيب التقويم فحصاً كاملاً: فحص سريري، صورة إشعاعية بانورامية، صورة إشعاعية جانبية (قياس قحفي) وبصمات أو مسح رقمي للأقواس السنية. تتيح هذه العناصر تحليل وضعية الأسنان ونمو الفكّين والعلاقات بين أعلى الوجه وأسفله. في المغرب، يُقترح هذا الفحص في القطاع الخاص كما في بعض المصالح الاستشفائية الجامعية.",
          "انطلاقاً من هذا التشخيص، يضع الممارس خطة علاج شخصية وفاتورة تقديرية مفصّلة تشمل المدة المتوقّعة ونوع الجهاز وعدد الزيارات. هذه هي اللحظة المناسبة لطرح أسئلتك حول البدائل والتكلفة الإجمالية والتغطية من طرف AMO. الخطة الواضحة والمكتوبة دليل على الجدّية وتحميك في حال حدوث خلاف لاحق.",
        ],
      },
      {
        h: "التقويم والجراحة: متى يجتمعان",
        body: [
          "بعض التفاوتات الكبيرة بين الفكّ العلوي والسفلي لا يمكن تصحيحها بالجهاز السنّي وحده بعد انتهاء النمو. في هذه الحالات، يعمل طبيب التقويم ضمن فريق مع جرّاح الوجه والفكّين: هذا هو التقويم الجراحي الذي يجمع بين مرحلة تحضير بالجهاز، وتدخّل في غرفة العمليات، ثمّ مرحلة إنهاء. يهمّ هذا المسار خاصةً البالغ الذي يعاني من تفاوت هيكلي واضح.",
          "يجري هذا النوع من العلاج في وسط استشفائي أو في عيادة ويتطلّب تنسيقاً وثيقاً بين الممارسين. تكون الآجال أطول والتكلفة أعلى من العلاج التقليدي، لكنّ النتيجة تشمل الوظيفة (المضغ، التنفّس) بقدر ما تشمل الجانب الجمالي. في حال رضّ وجهي حادّ مصحوب بكسر أو نزيف مهمّ، فالأمر استعجالي: اتّصل بالرقم 15 (SAMU) دون تأخير.",
        ],
      },
    ],
    prix: {
      title: "كم يكلّف علاج تقويم الأسنان بالمغرب؟",
      intro: "الأتعاب حرّة وتتوقّف على التقنية والمدة. ويُؤدّى عادة على أقساط شهرية. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة / فحص تقويمي", value: "150 – 400 درهم" },
        { label: "علاج بالتقويم المعدني", value: "8 000 – 15 000 درهم" },
        { label: "علاج بالتقويم الخزفي", value: "12 000 – 20 000 درهم" },
        { label: "قوالب شفافة", value: "15 000 – 25 000 درهم" },
      ],
      note: "أسعار إرشادية (2026)، تُؤدّى غالبًا على أقساط. وقد يستفيد المؤمَّنون لدى CNSS وAMO من تكفّل جزئي، خاصة للأطفال.",
    },
  },

  "gastro-enterologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الجهاز الهضمي هو الطبيب المختص في الجهاز الهضمي: المريء، المعدة، الأمعاء، القولون، الكبد، القنوات الصفراوية والبنكرياس. يشخّص ويعالج الارتجاع المعدي المريئي، والقرحة، ومتلازمة القولون العصبي، والأمراض الالتهابية المزمنة للأمعاء (داء كرون، التهاب القولون التقرّحي)، والتهابات الكبد واضطرابات العبور. ويُجري الفحوص التنظيرية المرجعية — التنظير المعدي والتنظير القولوني — التي تتيح استكشاف الأنبوب الهضمي والكشف المبكر عن سرطان القولون والمستقيم. وبالمغرب، تُعدّ الاضطرابات الهضمية والتهابات الكبد الفيروسية أسبابًا متكررة للاستشارة، ويكتسب الكشف عن سرطان القولون بعد سن 50 أهمية متزايدة. ويعتمد طبيب الجهاز الهضمي على هذه الفحوص والتصوير والتحاليل لوضع تشخيص دقيق واقتراح علاج طبي أو، عند الحاجة، التوجيه إلى الجراحة.",
    quandConsulter: [
      "حرقة في المعدة أو ارتجاع مستمر",
      "آلام بطنية مزمنة أو انتفاخ",
      "اضطرابات العبور (إسهال، إمساك، دم في البراز)",
      "الكشف عن سرطان القولون بعد سن 50",
      "متابعة التهاب الكبد أو مرض في الكبد",
    ],
    faqs: [
      { q: "ما هو التنظير المعدي والتنظير القولوني؟", a: "يستكشف التنظير المعدي المريء والمعدة والاثني عشر بواسطة كاميرا مرنة؛ ويستكشف التنظير القولوني القولون. وتتيح هذه الفحوص، التي تُجرى غالبًا تحت تخدير خفيف، التشخيص وأحيانًا العلاج (إزالة السلائل) في الوقت نفسه." },
      { q: "كم تكلّف استشارة طبيب الجهاز الهضمي بالمغرب؟", a: "تكلّف الاستشارة عمومًا بين 300 و600 درهم حسب المدينة والممارس. ويخضع التنظير المعدي أو القولوني لمصاريف منفصلة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي بملف." },
      { q: "في أي سن يُجرى الكشف عن سرطان القولون؟", a: "يُنصح بالكشف عن سرطان القولون والمستقيم ابتداءً من سن 50، أو أبكر عند وجود سوابق عائلية. ويتيح التنظير القولوني اكتشاف السلائل وإزالتها قبل تطوّرها، ما يجعله فحصًا فعّالًا جدًّا للوقاية." },
      { q: "كيف أحجز موعدًا مع طبيب الجهاز الهضمي بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « أمراض الجهاز الهضمي » ومدينتك لإيجاد ممارس متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "كيف أستعد لتنظير القولون في المغرب؟", a: "يعتمد التحضير على نظام غذائي خالٍ من الألياف في الأيام السابقة للفحص، ثم تناول محلول ملين (PEG) وفق البروتوكول الذي يسلمه لك طبيب الجهاز الهضمي لتنظيف القولون بالكامل. يجب أن تكون صائماً قبل الفحص وأن ترتب لمرافق، لأن التخدير يمنعك من القيادة بعده. التحضير الجيد يحدد مباشرة جودة الفحص ودقة نتائجه." },
      { q: "هل يغطي CNSS أو AMO تكلفة تنظير المعدة والقولون؟", a: "يندرج هذان الفحصان ضمن قائمة الأعمال الطبية ويمكن أن يخضعا لتعويض جزئي من التأمين الإجباري عن المرض (CNSS، CNOPS) على أساس التعريفات المرجعية، خاصة عندما يوصف الفحص لسبب طبي. يعتمد المبلغ المتبقي على عاتقك على القطاع (عام أو عيادة خاصة) وعلى تجاوز الأتعاب المحتمل. اطلب تسعيرة وورقة علاجات مفصلة لتكوين ملف التعويض." },
      { q: "هل الإصابة ببكتيريا Helicobacter pylori خطيرة؟", a: "بكتيريا Helicobacter pylori هي جرثومة معدية شائعة جداً في المغرب، تُكتسب غالباً في الطفولة، وهي مسؤولة عن العديد من التهابات المعدة والقرحات. يُكشف عنها عبر اختبار التنفس أو تحليل البراز أو أخذ خزعة أثناء تنظير المعدة، ثم تُعالج بمزيج من المضادات الحيوية ومضادات الحموضة. يؤدي العلاج الجيد في أغلب الحالات إلى القضاء التام على البكتيريا، مع نصح بإجراء فحص مراقبة بعد انتهاء العلاج." },
      { q: "متى يستدعي الإمساك أو الإسهال استشارة الطبيب؟", a: "يجب استشارة طبيب الجهاز الهضمي إذا استمرت اضطرابات العبور عدة أسابيع، أو تفاقمت، أو صاحبتها علامات تحذيرية: دم في البراز، فقدان وزن غير مبرر، آلام ليلية، فقر دم أو حمى. لدى شخص تجاوز الخمسين، فإن أي تغير حديث ودائم في العبور يستدعي دائماً استشارة. في حالة إسهال حاد مع جفاف أو حمى مرتفعة أو ألم شديد، اتصل بالمستعجلات (SAMU 15)." },
      { q: "ما الفحوصات التي تسمح باستكشاف الكبد والبنكرياس؟", a: "إلى جانب تحليل الدم (الفحص الكبدي، إنزيمات البنكرياس)، يعتمد طبيب الجهاز الهضمي على التصوير بالصدى للبطن في المقام الأول، ويكمله عند الحاجة بالتصوير المقطعي أو بالرنين المغناطيسي IRM. بالنسبة للقنوات الصفراوية والبنكرياس، قد يُطلب IRM خاص (cholangio-IRM) أو تنظير بالصدى الداخلي. يعتمد اختيار الفحوصات على الأعراض وعلى النتائج البيولوجية الأولى." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "ابتداءً من 50", label: "الكشف عن سرطان القولون" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الارتجاع وحرقة المعدة والقرحة",
        body: [
          "يسبّب الارتجاع المعدي المريئي حرقة تصعد خلف عظم القصّ، خاصة بعد الوجبات أو في وضعية الاستلقاء. وهو متكرر وغالبًا حميد، لكنه قد يؤثّر على جودة الحياة ويضرّ المريء على المدى البعيد.",
          "وحين يكون مستمرًّا، مصحوبًا بصعوبة في البلع أو نقص في الوزن، يُنصح بتنظير معدي للبحث عن التهاب المريء أو قرحة أو جرثومة الملوية البوابية التي تُعالَج بالمضادات الحيوية.",
        ],
      },
      {
        h: "الكشف عن سرطان القولون والمستقيم",
        body: [
          "سرطان القولون من أكثر السرطانات شيوعًا، لكنه أيضًا من أكثرها قابلية للتفادي: يتطوّر غالبًا انطلاقًا من سلائل يتيح التنظير القولوني إزالتها قبل أي تحوّل.",
          "والكشف ابتداءً من سن 50، أو أبكر عند وجود سوابق عائلية، ينقذ الأرواح. وأي نزيف في البراز أو تغيّر دائم في العبور يستدعي استشارة دون انتظار.",
        ],
      },
      {
        h: "متلازمة القولون العصبي والاضطرابات الوظيفية",
        body: [
          "تجمع متلازمة القولون العصبي بين آلام بطنية وانتفاخ واضطرابات في العبور، دون آفة ظاهرة. وهي شائعة جدًّا، حميدة لكنها معيقة أحيانًا في الحياة اليومية.",
          "ويؤكّد طبيب الجهاز الهضمي التشخيص باستبعاد أسباب أخرى، ثم يقترح تدابير غذائية وتدبير التوتّر وعلاجات تستهدف الأعراض.",
        ],
      },
      {
        h: "التهابات الكبد وصحة الكبد",
        body: [
          "قد يصاب الكبد بالتهابات فيروسية (B وC) أو بالكحول أو بتراكم الدهون (الكبد الدهني)، غالبًا دون عرض في البداية. ويتيح تحليل دموي وصدى الكشف عنها.",
          "ويضمن طبيب الجهاز الهضمي متابعة وعلاج هذه الإصابات؛ وتستفيد التهابات الكبد الفيروسية اليوم من علاجات فعّالة، ومن هنا أهمية الكشف المبكر.",
        ],
      },
      {
        h: "التعرف على العلامات التحذيرية الهضمية",
        body: [
          "بعض الأعراض الهضمية يجب أن تدفع إلى استشارة طبيب الجهاز الهضمي دون تأخير، لأنها قد تكشف عن مرض يستوجب تكفلاً سريعاً. من بين هذه العلامات التحذيرية وجود دم في البراز أو القيء، صعوبة أو ألم عند البلع، فقدان وزن غير مبرر، فقر دم، آلام بطنية مستمرة أو ليلية، إضافة إلى تغير دائم في العبور بعد سن الخمسين. لا تعني هذه المظاهر بالضرورة مرضاً خطيراً، لكنها تبرر إجراء فحص لاستبعاد الأسباب الجدية.",
          "في حالة ألم بطني مفاجئ وشديد، أو قيء دم غزير، أو براز أسود مصحوب بوعكة، أو علامات جفاف حاد، فالأمر يتعلق بحالة مستعجلة: اتصل فوراً بالمستعجلات (SAMU 15). خارج هذه الحالات الحادة، يتيح موعد مبرمج مع طبيب الجهاز الهضمي إجراء الفحوصات المناسبة، مثل تنظير المعدة أو التصوير بالصدى، وتوجيه التشخيص. الاستشارة المبكرة تحسّن بشكل واضح فرص علاج بسيط وفعال.",
        ],
      },
      {
        h: "دور التغذية ونمط الحياة",
        body: [
          "ترتبط العديد من الاضطرابات الهضمية التي يتابعها طبيب الجهاز الهضمي ارتباطاً وثيقاً بنمط الحياة. فالتغذية المتوازنة الغنية بالألياف، والترطيب الجيد، والاستهلاك المعتدل للأطعمة الدهنية أو الحارة أو شديدة السكر، إضافة إلى الحد من الكحول والتدخين، كلها عوامل تساهم في الراحة الهضمية والوقاية من عدة أمراض. كما يشجع النشاط البدني المنتظم على عبور طبيعي ويساهم في صحة الكبد، خصوصاً بالحد من التنكس الدهني الكبدي الشائع في المغرب المرتبط بزيادة الوزن والسكري.",
          "لا يقتصر طبيب الجهاز الهضمي على علاج الأعراض، بل يدمج نصائح شخصية حول نمط الحياة ضمن التكفل الشامل بالمريض. فتكييف التغذية، والتحكم في التوتر، واحترام مواعيد وجبات منتظمة تشكل غالباً جزءاً لا يتجزأ من العلاج، إلى جانب الأدوية عند الحاجة إليها. هذه الإجراءات البسيطة لكن المستدامة تقلل من الانتكاسات وتحسّن جودة الحياة على المدى الطويل.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة طبيب الجهاز الهضمي بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص التنظيرية على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "300 – 600 درهم" },
        { label: "تنظير معدي", value: "800 – 2 000 درهم" },
        { label: "تنظير قولوني", value: "1 500 – 4 000 درهم" },
        { label: "صدى البطن", value: "300 – 600 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },

  "oto-rhino-laryngologie": {
    reviewed: "2026-07-05",
    description:
      "أخصائي الأنف والأذن والحنجرة (ORL) هو الطبيب المختص في الأذنين والأنف والحنجرة وبنيات الرأس والعنق. يشخّص ويعالج التهابات الأذن، وانخفاض السمع وطنين الأذن، والدوار، والتهابات الجيوب والحساسية الأنفية، والتهابات الحلق المتكررة، واضطرابات الصوت، وأمراض اللوزتين والزوائد الأنفية. وهو أيضًا جرّاح: يجري عمليات اللوزتين والزوائد والجيوب، أو يضع أنابيب تهوية عبر طبلة الأذن لدى الطفل. وبالمغرب، تُعدّ التهابات الأنف والأذن والحنجرة لدى الطفل والتهابات الجيوب المزمنة لدى البالغ من الأسباب المتكررة جدًّا للاستشارة. ويستكشف الأخصائي السمع (تخطيط السمع) والتوازن والمسالك الهوائية بفحوص مخصّصة، ثم يقترح علاجًا طبيًّا أو جراحيًّا مناسبًا. كما يتكفّل بالشخير وانقطاع النفس النومي المرتبطين بالمسالك الهوائية العلوية.",
    quandConsulter: [
      "التهابات أذن متكررة أو آلام في الأذن",
      "انخفاض السمع أو طنين أو دوار",
      "التهاب جيوب مزمن أو انسداد الأنف أو حساسية",
      "التهابات حلق متكررة، لوزتان أو زوائد (الطفل)",
      "بحّة مستمرة أو اضطرابات في الصوت",
    ],
    faqs: [
      { q: "متى يجب استئصال لوزتي الطفل أو زوائده؟", a: "يُدرَس الاستئصال عند تكرّر التهابات الحلق، أو انقطاع النفس النومي، أو التهابات الأذن المصلية المتكررة، أو انسداد أنفي يعيق التنفّس والنوم. ويقيّم الأخصائي ميزان الفائدة والمخاطر حالةً بحالة." },
      { q: "كم تكلّف استشارة أخصائي ORL بالمغرب؟", a: "تكلّف الاستشارة عمومًا بين 250 و500 درهم حسب المدينة والممارس. ويخضع تخطيط السمع والأعمال الجراحية لمصاريف منفصلة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "ماذا أفعل عند انخفاض السمع أو الطنين؟", a: "يبرّر انخفاض السمع أو الطنين المستمر استشارة ORL مع تخطيط للسمع. وقد يكون السبب مجرّد سدادة صملاخ، أو التهاب أذن، أو إصابة في الأذن الداخلية تستلزم تكفّلًا خاصًّا." },
      { q: "كيف أحجز موعدًا مع أخصائي ORL بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الأنف والأذن والحنجرة » ومدينتك لإيجاد أخصائي متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "ما هي أعراض سرطان الأنف والأذن والحنجرة ومتى يجب استشارة الطبيب بسرعة؟", a: "بحّة في الصوت تستمر أكثر من ثلاثة أسابيع، أو ألم أو انزعاج دائم في الحلق، أو صعوبة في البلع، أو عقدة صلبة في الرقبة لا تختفي، كلها أسباب لاستشارة طبيب ORL دون تأخير. يزيد التدخين والكحول من الخطر. تسمح الاستشارة المبكرة بفحص الحلق والحنجرة، وأخذ خزعة عند الحاجة." },
      { q: "كيف تتم إزالة سدادة الصملاخ (الشمع) عند طبيب ORL؟", a: "يفحص الطبيب القناة السمعية بالمجهر ثم يزيل السدادة بالشفط الدقيق أو بالملعقة الطبية أو بالغسل بماء فاتر. الإجراء غير مؤلم ويستغرق دقائق قليلة. يُنصح بتجنّب أعواد القطن أو شموع الأذن لأنها تدفع الشمع وقد تجرح طبلة الأذن." },
      { q: "ماذا نفعل في حالة نزيف الأنف المتكرر (الرعاف)؟", a: "عند النزيف، أمِل الرأس قليلاً إلى الأمام واضغط بقوة على جناحي الأنف لمدة عشر دقائق مع التنفس من الفم. إذا استمر النزيف أكثر من عشرين دقيقة أو كان غزيراً جداً أو تكرر كثيراً، فاستشر طبيب ORL أو المستعجلات. قد يكشف النزيف المتكرر عن ارتفاع في ضغط الدم أو هشاشة في الأوعية تستوجب العلاج." },
      { q: "هل وجود جسم غريب عالق في الأنف أو الأذن أو الحلق حالة طارئة؟", a: "عند الطفل، تستوجب كرة أو بطارية زر أو طعام عالق في الأنف أو الأذن رأياً سريعاً من طبيب ORL، لأن البطارية قد تحرق الأنسجة في ساعات قليلة. إذا سدّ جسم أو طعام الحلق وأعاق التنفس، اتصل فوراً بالرقم 15 (SAMU). لا تحاول إخراج الجسم بنفسك تفادياً لدفعه أعمق." },
      { q: "هل يلزم وصفة أو فحص مسبق قبل استشارة طبيب ORL في المغرب؟", a: "في القطاع الخاص، يمكنك استشارة طبيب ORL مباشرة دون تحويل من طبيب عام. في القطاع العام (المستشفيات الجامعية والمستشفيات)، غالباً ما يسهّل المرور عبر الطبيب المعالج أو المركز الصحي الوصول. أحضر فحوصاتك السابقة (تخطيط السمع، السكانير، IRM) إن وُجدت لتجنّب إعادتها." },
    ],
    essentiel: [
      { value: "250 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "الأذن · الأنف · الحنجرة", label: "مجال التخصص" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "التهابات الأنف والأذن والحنجرة لدى الطفل",
        body: [
          "التهابات الأذن والبلعوم الأنفي والحلق متكررة جدًّا لدى الطفل، الذي لا يزال جهازه المناعي في طور التكوّن. ويشفى معظمها ببساطة، لكن تكرارها قد يبرّر رأي أخصائي ORL.",
          "وقد تعيق التهابات الأذن المصلية المطوّلة السمع واللغة: ويتيح الكشف اقتراح أنابيب تهوية عبر طبلة الأذن، عند الحاجة، لإعادة سمع جيد.",
        ],
      },
      {
        h: "التهابات الجيوب والحساسية الأنفية",
        body: [
          "يوحي انسداد الأنف المزمن والإفرازات وآلام الوجه بالتهاب الجيوب أو التهاب الأنف التحسّسي، الشائعَين بالمغرب في موسم الغبار وحبوب اللقاح.",
          "ويميّز الأخصائي بين الأصل التحسّسي أو العدوائي أو التشريحي (انحراف الحاجز، سلائل) ويقترح علاجًا مناسبًا، من غسل الأنف إلى البخاخات، وصولًا إلى الجراحة في الحالات المقاومة.",
        ],
      },
      {
        h: "السمع والطنين والدوار",
        body: [
          "يستكشف الأخصائي السمع بتخطيط السمع ويبحث عن سبب انخفاض السمع أو الطنين أو الدوار، التي قد تنشأ من الأذن الخارجية أو الوسطى أو الداخلية.",
          "ويحسّن التكفّل المبكر المآل: أجهزة سمعية، علاج طبي، أو إعادة تأهيل دهليزي لاضطرابات التوازن، حسب التشخيص.",
        ],
      },
      {
        h: "الشخير وانقطاع النفس النومي",
        body: [
          "يُتعب الشخير وتوقّفات التنفّس أثناء النوم (انقطاع النفس) ويعرّضان لمخاطر قلبية وعائية. وهما غالبًا مرتبطان بعائق على المسالك الهوائية العلوية.",
          "ويقيّم الأخصائي هذه المسالك ويساهم في تشخيص متلازمة انقطاع النفس النومي، التي يحسّن تكفّلها (جهاز تهوية، أحيانًا جراحة) جودة الحياة بوضوح.",
        ],
      },
      {
        h: "جراحة الأنف والأذن والحنجرة: من الاستشارة إلى العملية",
        body: [
          "يتكفّل طبيب ORL بعدد من العمليات الشائعة: استئصال اللوزتين واللحمية، ووضع أنابيب تهوية عبر الطبلة، وجراحة الأنف والجيوب، وتصحيح انحراف الحاجز الأنفي، وكذلك جراحة الأذن. تُجرى الكثير من هذه العمليات اليوم في نظام العلاج النهاري مع الخروج في اليوم نفسه، تحت التخدير العام أو الموضعي حسب الحالة. يُطلب فحص ما قبل الجراحة واستشارة طبيب التخدير قبل أي تدخّل مبرمج.",
          "في المغرب، تُجرى هذه الأعمال في العيادات الخاصة أو المستشفيات العمومية. في القطاع الخاص، تُضاف أتعاب الجرّاح وطبيب التخدير إلى تكلفة العيادة، لذا يُستحسن طلب فاتورة تقديرية مفصّلة مسبقاً والتحقق من التغطية لدى هيئتك (CNSS/AMO) وفق التعريفة المرجعية لـ ANAM. استفسر عن نسبة الاسترجاع وعن المبلغ المتبقّي على عاتقك قبل الالتزام.",
        ],
      },
      {
        h: "التحضير لاستشارة الأنف والأذن والحنجرة",
        body: [
          "للاستفادة القصوى من موعدك، دوّن مسبقاً أعراضك ومدّتها والظروف التي تفاقمها (الضجيج، الوضعية، الفصل، التغذية). أحضر لائحة أدويتك الحالية وسوابقك المرضية وكل فحص سبق إجراؤه: تخطيط السمع، سكانير الجيوب، IRM أو تقرير عملية سابقة. إذا كنت تستشير من أجل طفلك، حدّد نوبات التهاب الأذن أو الشخير أو العدوى المتكررة لديه.",
          "فحص الأنف والأذن والحنجرة غير مؤلم في معظمه: يفحص الطبيب الأذنين والأنف والحلق، أحياناً باستعمال مجهر أو منظار دقيق (تنظير الأنف الليفي) لاستكشاف التجاويف الأنفية والحنجرة. قد تُطلب فحوصات إضافية مثل تخطيط السمع أو التصوير في اليوم نفسه أو في موعد ثانٍ. لا تتردد في طرح أسئلتك حول التشخيص وخيارات العلاج والمتابعة.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة أخصائي ORL بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الفحوص والأعمال الجراحية على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "250 – 500 درهم" },
        { label: "تخطيط السمع (فحص سمعي)", value: "200 – 500 درهم" },
        { label: "استئصال اللوزتين (عيادة)", value: "6 000 – 15 000 درهم" },
        { label: "جراحة الجيوب", value: "8 000 – 20 000 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },

  "pneumo-phtisiologie": {
    reviewed: "2026-07-05",
    description:
      "طبيب الرئة هو الطبيب المختص في الجهاز التنفّسي: الرئتان والقصبات والجنبة. يشخّص ويعالج الربو، والداء الانسدادي الرئوي المزمن (BPCO)، والتهابات الجهاز التنفّسي، والحساسية الرئوية، وانقطاع النفس النومي، والسلّ — أي طب السلّ. ويحتفظ هذا الأخير بأهمية خاصة بالمغرب، حيث يبقى السلّ قضية صحة عمومية تخضع لبرنامج وطني للكشف والعلاج المجاني. ويعتمد طبيب الرئة على فحوص مخصّصة: صورة وسكانير للصدر، استكشاف وظيفي تنفّسي (قياس التنفّس)، اختبارات حساسية وتسجيل النوم. ولأن التدخين هو السبب الرئيسي لأمراض الجهاز التنفّسي المزمنة، يؤدّي طبيب الرئة أيضًا دورًا أساسيًّا في المساعدة على الإقلاع عن التدخين. ويبرّر أي سعال مستمر أو ضيق تنفّس غير معتاد أو نفث دم استشارة.",
    quandConsulter: [
      "سعال مستمر لأكثر من ثلاثة أسابيع",
      "ضيق تنفّس غير معتاد أو صفير تنفّسي",
      "نوبات ربو أو حساسية تنفّسية",
      "اشتباه في السلّ أو متابعته",
      "شخير مع تعب (انقطاع النفس النومي) أو الإقلاع عن التدخين",
    ],
    faqs: [
      { q: "هل يُشفى السلّ بالمغرب؟", a: "نعم. يُشفى السلّ بفضل علاج بالمضادات الحيوية مطوّل (عدة أشهر)، يُؤخذ بانتظام. وبالمغرب، يُضمَن الكشف والعلاج مجانًا في إطار البرنامج الوطني لمحاربة السلّ." },
      { q: "كم تكلّف استشارة طبيب الرئة بالمغرب؟", a: "تكلّف الاستشارة عمومًا بين 300 و600 درهم حسب المدينة والممارس. وتخضع الاستكشافات (قياس التنفّس، السكانير) لمصاريف منفصلة؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي." },
      { q: "متى نقلق من سعال مستمر؟", a: "سعال يدوم أكثر من ثلاثة أسابيع، خاصة لدى مدخّن، أو مصحوب بضيق تنفّس أو حمى مطوّلة أو نقص وزن أو نفث دم، يستدعي استشارة طبيب رئة للبحث عن السبب." },
      { q: "كيف أحجز موعدًا مع طبيب الرئة بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « أمراض الرئة » ومدينتك لإيجاد طبيب رئة متاح، والاطّلاع على آراء المرضى الموثوقة، والحجز عبر الإنترنت مجانًا." },
      { q: "ما هو اختبار وظائف التنفس (EFR / قياس التنفس)؟", a: "يقيس اختبار وظائف التنفس نَفَسك: أحجام الهواء وتدفقاته أثناء الشهيق والزفير. هذا الفحص غير مؤلم، يُجرى في عيادة أمراض الرئة، ويساعد على تشخيص ومتابعة الربو أو الداء الرئوي الانسدادي المزمن أو التليف الرئوي. يستغرق بضع دقائق ويتمثل في النفخ داخل قطعة فموية حسب تعليمات التقني. وقد يُسترجع جزء من التكلفة عبر AMO/CNSS حسب تسعيرة ANAM." },
      { q: "متى يجب إجراء صورة إشعاعية أو أشعة مقطعية للصدر؟", a: "قد يصف طبيب الرئة صورة إشعاعية للصدر أمام سعال مطوّل أو ضيق في التنفس أو اشتباه في عدوى. أما الأشعة المقطعية (TDM) فتُطلب لتوضيح صورة غير طبيعية أو استكشاف عُقيدات أو اشتباه في انصمام رئوي. هذه الفحوص متوفرة على نطاق واسع في القطاعين الخاص والعام بالمغرب. أحضِر دائمًا صورك القديمة للمقارنة." },
      { q: "ما العلامات التنفسية التي تفرض الاتصال بالمستعجلات (15)؟", a: "اتصل فورًا بالإسعاف (15) عند ضيق تنفس مفاجئ، أو ألم صدري شديد، أو ازرقاق الشفتين أو الأظافر، أو العجز عن الكلام بسبب انقطاع النفس. كما تُعدّ نوبة ربو لا تستجيب للعلاج المعتاد وبصق دم غزير حالات طارئة. لا تقُد سيارتك بنفسك: من الأفضل تلقي الرعاية دون تأخير." },
      { q: "كيف يُعالَج الالتهاب الرئوي بالمغرب؟", a: "يُعالَج الالتهاب الرئوي (عدوى الرئة) في الغالب بالمضادات الحيوية مع الراحة وشرب السوائل. يقيّم طبيب الرئة درجة الخطورة ويقرر العلاج في المنزل أو الاستشفاء إذا كان الأكسجين غير كافٍ أو كانت الحالة الصحية هشّة. وقد تُطلب صورة إشعاعية للمراقبة للتأكد من الشفاء. استشِر بسرعة إذا ازدادت الحمى وضيق التنفس سوءًا." },
      { q: "هل يمكن لطبيب الرئة المساعدة على الإقلاع عن التدخين؟", a: "نعم، المساعدة على الإقلاع عن التدخين جزء من الممارسة الاعتيادية لطبيب الرئة. فهو يقيّم درجة إدمانك، ويقترح مرافقة، ويمكنه وصف بدائل النيكوتين أو علاج مناسب. تزيد المتابعة المنتظمة فرص النجاح بوضوح. وهي أيضًا فرصة للكشف المبكر عن الداء الرئوي الانسدادي المزمن أو غيره من الأضرار المرتبطة بالتدخين." },
    ],
    essentiel: [
      { value: "300 – 600 درهم", label: "ثمن الاستشارة" },
      { value: "السلّ", label: "كشف وعلاج مجانيان" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "الربو والحساسية التنفّسية",
        body: [
          "يتجلّى الربو في نوبات ضيق تنفّس وسعال وصفير، تثيرها غالبًا مسبّبات الحساسية أو الجهد أو العدوى. وبالتحكّم الجيد فيه، يتيح حياة طبيعية.",
          "ويؤكّد طبيب الرئة التشخيص باستكشاف وظيفي تنفّسي، ويحدّد العوامل المثيرة، ويضبط علاجًا أساسيًّا لمباعدة النوبات وتفادي المضاعفات.",
        ],
      },
      {
        h: "السلّ: التعرّف والعلاج",
        body: [
          "السلّ مرض معدٍ يصيب الرئتين أساسًا، ويتجلّى في سعال دائم وحمى وتعرّق ليلي ونقص وزن. ويحدّ الكشف المبكر من انتقال العدوى.",
          "وبالمغرب، يضمن البرنامج الوطني تشخيصًا وعلاجًا مجانيين. ويعتمد الشفاء على أخذ المضادات الحيوية بانتظام وبشكل كامل طوال المدة الموصوفة.",
        ],
      },
      {
        h: "الداء الانسدادي الرئوي المزمن والتدخين",
        body: [
          "الداء الانسدادي الرئوي المزمن مرض تنفّسي مزمن سببه الرئيسي التبغ. يقلّل النفَس تدريجيًّا ويبقى ناقص التشخيص ما دامت الضائقة تُنسب إلى السنّ أو السيجارة.",
          "ويكشف طبيب الرئة هذا الداء بقياس التنفّس ويرافق الإقلاع عن التدخين، وهو أنجع إجراء لإبطاء المرض والحفاظ على الوظيفة الرئوية.",
        ],
      },
      {
        h: "انقطاع النفس النومي",
        body: [
          "تسبّب متلازمة انقطاع النفس النومي توقّفات تنفّسية ليلية، ونومًا غير مريح، ونعاسًا نهاريًّا، مع خطر قلبي وعائي مرتفع.",
          "ويؤكّد تسجيل النوم التشخيص. ويحسّن التكفّل (جهاز تهوية ليلي، تدابير صحية غذائية) الطاقة والسلامة في الحياة اليومية بوضوح.",
        ],
      },
      {
        h: "فحوص طبيب الرئة: من قياس التنفس إلى الأشعة المقطعية",
        body: [
          "يعتمد التشخيص في طب الرئة على عدة فحوص مكمّلة. يقيس اختبار وظائف التنفس (EFR أو قياس التنفس) سعة رئتيك وتدفقاتها؛ وهو الفحص المفتاح لتأكيد الربو أو الداء الرئوي الانسدادي المزمن ومتابعة تطوره. تبقى الصورة الإشعاعية للصدر أول فحص تصويري، تُستكمل عند الحاجة بأشعة مقطعية للصدر لتحليل العُقيدات أو عدوى أو اشتباه في انصمام. أما قياس الأكسجين، وهو قياس بسيط عند طرف الإصبع، فيقيّم بسرعة نسبة الأكسجين في الدم.",
          "بالمغرب، هذه الفحوص متاحة في العيادات والمصحّات الخاصة كما في المستشفيات العمومية. وقد يُغطّى جزء من المصاريف عبر AMO أو CNSS حسب تسعيرة ANAM، لكن أتعاب القطاع الخاص تبقى حرة: اطلب دائمًا تسعيرة قبل إجراء أشعة مقطعية. واحرص على إحضار تقاريرك وصورك السابقة، لأن المقارنة عبر الزمن غالبًا ما تكون أوضح لطبيب الرئة من صورة منفردة.",
        ],
      },
      {
        h: "التعرّف على الحالات التنفسية الطارئة",
        body: [
          "بعض الحالات التنفسية لا يمكن أن تنتظر استشارة مبرمجة. فضيق التنفس المفاجئ، والألم الصدري الشديد، وازرقاق الشفتين أو الأطراف، أو العجز عن إتمام جملة دون التقاط الأنفاس، كلها إشارات إنذار. كما أن نوبة ربو لا تستجيب للعلاج الإسعافي المعتاد، وكذلك بصق يحتوي على دم بكمية مهمة، يجب أن يؤديا إلى تكفّل فوري.",
          "أمام هذه العلامات، اتصل دون تأخير بالإسعاف على الرقم 15 بدل التنقل بمفردك، خاصة ليلًا أو بعيدًا عن مؤسسة صحية. وفي انتظار الإسعاف، ضع الشخص في وضعية الجلوس، وفكّ ملابسه، وحافظ على الهدوء للحد من التفاقم. قد يكون هذا التصرف منقذًا للحياة في حالات مثل الانصمام الرئوي أو القصور التنفسي الحاد. والمتابعة المنتظمة عند طبيب الرئة تتيح تحديدًا استباق هذه النوبات وتعديل العلاج الأساسي.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف استشارة طبيب الرئة بالمغرب؟",
      intro: "أتعاب الاستشارة حرّة؛ وتُفوتر الاستكشافات على حدة. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة", value: "300 – 600 درهم" },
        { label: "استكشاف وظيفي تنفّسي (قياس التنفّس)", value: "200 – 500 درهم" },
        { label: "صورة الصدر بالأشعة", value: "150 – 350 درهم" },
        { label: "سكانير الصدر", value: "1 000 – 2 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). الكشف عن السلّ وعلاجه مجانيان في إطار البرنامج الوطني. يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي عند تقديم الوصفة.",
    },
  },

  "radiologie": {
    description:
      "طبيب الأشعة هو الطبيب المختص في التصوير الطبي. يُجري ويفسّر الفحوص التي تتيح رؤية داخل الجسم: التصوير بالأشعة، الصدى، تصوير الثدي، السكانير، والرنين المغناطيسي (IRM). وتُطلَب هذه الفحوص بوصفة من طبيب آخر لتأكيد تشخيص أو مراقبة مرض أو توجيه علاج. لذلك لا يُستشار طبيب الأشعة كخيار أول: يُحجَز موعد في عيادة أو مركز تصوير مع الوصفة. وبالمغرب، الولوج إلى الصدى والتصوير بالأشعة واسع، بينما يتركّز السكانير والرنين في المدن الكبرى والمراكز المتخصصة. وإلى جانب التشخيص، يتيح التصوير التداخلي إنجاز بعض الأعمال الموجّهة بالصورة (خزعات، حقن). ويوجّه تقرير طبيب الأشعة، المُرسَل إلى الطبيب الواصف، باقي مسار التكفّل.",
    quandConsulter: [
      "تصوير بالأشعة موصوف بعد رضّ أو ألم",
      "صدى للمتابعة (البطن، الغدة الدرقية، الحمل)",
      "تصوير الثدي للكشف عن السرطان",
      "سكانير أو رنين مغناطيسي يطلبه طبيبك",
      "فحص بالتصوير قبل تدخّل",
    ],
    faqs: [
      { q: "ما الفرق بين السكانير والرنين المغناطيسي؟", a: "يستعمل السكانير الأشعة السينية وهو سريع، مثالي للعظام والصدر والطوارئ. أما الرنين المغناطيسي فيستعمل حقلًا مغناطيسيًّا (دون أشعة سينية) ويقدّم رؤية ممتازة للأنسجة الرخوة والدماغ والمفاصل. ويتوقّف الاختيار على الاستطباب الذي يحدّده طبيبك." },
      { q: "كم يكلّف فحص بالتصوير بالمغرب؟", a: "تكلّف الصورة بالأشعة نحو 150 إلى 350 درهمًا، والصدى 300 إلى 600 درهم، والسكانير 1 000 إلى 2 500 درهم، والرنين 2 000 إلى 4 500 درهم حسب المنطقة المُستكشَفة والمركز. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي عند تقديم الوصفة." },
      { q: "هل تلزم وصفة لإجراء فحص بالأشعة؟", a: "نعم، تُجرى فحوص التصوير بوصفة طبية تحدّد المنطقة المُستكشَفة والسؤال المطروح. وهذه الوصفة ضرورية للفحص وللاسترجاع معًا." },
      { q: "كيف أحجز موعدًا في مركز للأشعة بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « الأشعة » ومدينتك لإيجاد طبيب أشعة أو مركز تصوير، والاطّلاع على الآراء والحجز عبر الإنترنت مجانًا، ووصفتك في يدك." },
    ],
    essentiel: [
      { value: "بوصفة", label: "فحوص التصوير" },
      { value: "150 – 4 500 درهم", label: "حسب الفحص" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "أي فحص لأي حالة؟",
        body: [
          "يستكشف التصوير بالأشعة العظام والصدر أساسًا؛ ويراقب الصدى، دون أشعة، الأعضاء والغدة الدرقية ومتابعة الحمل. ويقدّم السكانير مقاطع مفصّلة سريعة، ويتفوّق الرنين على الدماغ والنخاع والمفاصل.",
          "والطبيب الواصف هو من يختار الفحص الأنسب للسؤال السريري. ويمكن لطبيب الأشعة مع ذلك أن يوجّه نحو فحص تكميلي إذا بَرّرَت الصورة ذلك.",
        ],
      },
      {
        h: "التصوير والإشعاع: هل يدعو للقلق؟",
        body: [
          "يستعمل التصوير بالأشعة والسكانير أشعة سينية بجرعات مضبوطة. أما الصدى والرنين المغناطيسي فلا يُشعّان. ولا تُوصَف الفحوص إلا حين تفوق فائدتها الخطر بوضوح.",
          "أبلِغ دائمًا عن حمل محتمل قبل فحص مُشِعّ. ويكيّف طبيب الأشعة عندئذٍ البروتوكول أو يقترح بديلًا دون أشعة.",
        ],
      },
      {
        h: "تصوير الثدي والكشف عن سرطان الثدي",
        body: [
          "تصوير الثدي هو الفحص المرجعي للكشف عن سرطان الثدي، ويُنصح به دوريًّا لدى المرأة ابتداءً من 40‑50 سنة أو أبكر عند وجود سوابق عائلية.",
          "ويتيح الكشف اكتشاف آفات مبكرة جدًّا، في مرحلة يكون فيها العلاج أبسط والمآل ممتازًا. ويكمّل طبيب الأشعة عند الحاجة بصدى للثدي.",
        ],
      },
      {
        h: "التقرير وباقي مسار التكفّل",
        body: [
          "بعد الفحص، يحرّر طبيب الأشعة تقريرًا يفسّر الصور، يُرسَل إليك وإلى طبيبك. وتُسلَّم لك الصور (أفلام أو قرص).",
          "ويوجّه هذا التقرير القرار الطبي: مراقبة أو فحص تكميلي أو علاج. احتفظ بفحوصك السابقة، فهي تتيح المقارنة وتقدير التطوّر.",
        ],
      },
    ],
    prix: {
      title: "كم يكلّف فحص بالتصوير بالمغرب؟",
      intro: "الأسعار حرّة وتتوقّف على الفحص والمنطقة المُستكشَفة والمركز. فئات أسعار إرشادية لكل فحص.",
      rows: [
        { label: "تصوير بالأشعة", value: "150 – 350 درهم" },
        { label: "صدى", value: "300 – 600 درهم" },
        { label: "تصوير الثدي", value: "400 – 800 درهم" },
        { label: "سكانير", value: "1 000 – 2 500 درهم" },
        { label: "رنين مغناطيسي (IRM)", value: "2 000 – 4 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للفحوص الموصوفة عند تقديم الوصفة.",
    },
  },

  "anesthesie-reanimation": {
    description:
      "طبيب التخدير والإنعاش هو الطبيب الذي يخدّر المريض ويراقبه أثناء العملية الجراحية، ثم يضمن سلامته عند الإفاقة. يبدأ دوره قبل العملية، خلال الاستشارة قبل التخدير الإلزامية: يقيّم الحالة الصحية والسوابق والأدوية، ويختار نوع التخدير (عام، ناحي، فوق الجافية)، ويشرح سيره. وأثناء التدخّل، يراقب الوظائف الحيوية باستمرار. كما يتدخّل في الإنعاش والعناية المركّزة لدى المرضى في وضع حرج، وكذلك في تدبير الألم. لذلك لا يُستشار طبيب التخدير في ولوج حرّ كأي أخصائي آخر: يرتبط اللقاء بجراحة مبرمَجة أو باستشفاء. وبالمغرب، تُعدّ الاستشارة قبل التخدير خطوة سلامة لا غنى عنها في أي مسار جراحي.",
    quandConsulter: [
      "استشارة قبل التخدير قبل جراحة مبرمَجة",
      "التحضير لولادة (تخدير فوق الجافية)",
      "تقييم المخاطر المرتبطة بالتخدير",
      "تدبير الألم المزمن أو ما بعد العملية",
      "معلومات حول نوع التخدير المرتقَب",
    ],
    faqs: [
      { q: "لماذا استشارة قبل التخدير قبل العملية؟", a: "هي إلزامية وأساسية للسلامة: يقيّم طبيب التخدير حالتك الصحية وسوابقك وأدويتك، ويختار نوع التخدير الأكثر أمانًا، ويشرح لك الصيام والتعليمات الواجب احترامها. وتجري قبل أيام من التدخّل المبرمَج." },
      { q: "كم تكلّف استشارة قبل التخدير بالمغرب؟", a: "تكلّف الاستشارة قبل التخدير عمومًا بين 200 و500 درهم. أما أتعاب تخدير العملية نفسها فمدمَجة في الكلفة الجراحية الإجمالية؛ ويستفيد المؤمَّنون لدى CNSS أو AMO من تكفّل جزئي بملف." },
      { q: "ما الفرق بين التخدير العام والناحي؟", a: "يخدّر التخدير العام المريض كليًّا. أما التخدير الناحي (تخدير نخاعي، فوق الجافية، حصار عصبي) فلا يُفقد الإحساس إلا في جزء من الجسم، مع بقاء المريض مستيقظًا. ويتوقّف الاختيار على التدخّل وحالتك الصحية." },
      { q: "كيف أحجز موعدًا مع طبيب تخدير بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « التخدير والإنعاش » ومدينتك لإيجاد طبيب تخدير وإنعاش، والاطّلاع على الآراء وحجز استشارتك قبل التخدير عبر الإنترنت مجانًا." },
    ],
    essentiel: [
      { value: "قبل الجراحة", label: "استشارة قبل التخدير" },
      { value: "200 – 500 درهم", label: "ثمن الاستشارة" },
      { value: "إلزامية", label: "خطوة سلامة" },
    ],
    sections: [
      {
        h: "الاستشارة قبل التخدير، خطوة أساسية في عمليتك",
        body: [
          "قبل أيام من تدخّل مبرمَج، يستقبلك طبيب التخدير لتقييم حالتك العامة وحساسياتك وأدويتك وفحوص محتملة الواجب إكمالها. وهو موعد سلامة، منفصل عن استشارة الجرّاح.",
          "ويشرح لك نوع التخدير وقواعد الصيام وتدبير أدويتك المعتادة. وهي اللحظة المناسبة لطرح أسئلتك حول السير والإفاقة.",
        ],
      },
      {
        h: "أنواع التخدير المختلفة",
        body: [
          "يُغرق التخدير العام المريض في نوم مُتحكَّم فيه طوال التدخّل. أما التخدير الناحي فلا يخدّر إلا منطقة من الجسم: التخدير النخاعي وفوق الجافية للجزء السفلي، والحصارات العصبية لطرف.",
          "ويتّخذ طبيب التخدير القرار حسب نوع الجراحة وصحتك وتفضيلاتك، بهدف أقصى راحة وسلامة.",
        ],
      },
      {
        h: "الإنعاش والعناية المركّزة",
        body: [
          "إلى جانب قاعة العمليات، يتكفّل طبيب التخدير والإنعاش بالمرضى في وضع حرج بالإنعاش والعناية المركّزة: قصور الأعضاء، أعقاب الجراحات الثقيلة، الطوارئ الحيوية.",
          "ويراقب فيها ويدعم الوظائف الحيوية (التنفّس، الدورة الدموية) بمعدات متخصصة، بتنسيق مع باقي الأخصائيين.",
        ],
      },
      {
        h: "تدبير الألم",
        body: [
          "يؤدّي طبيب التخدير دورًا مركزيًّا في علاج الألم، بعد العملية وكذلك في بعض الآلام المزمنة العنيدة.",
          "ويقترح تقنيات مناسبة (أدوية، حقن، حصارات) للتخفيف بفعالية، وتحسين التعافي بعد عملية، والحفاظ على جودة الحياة.",
        ],
      },
    ],
    prix: {
      title: "كم يكلّف التخدير بالمغرب؟",
      intro: "تُفوتر الاستشارة قبل التخدير على حدة؛ وتُدمَج أتعاب تخدير العملية في الكلفة الجراحية. فئات أسعار إرشادية.",
      rows: [
        { label: "استشارة قبل التخدير", value: "200 – 500 درهم" },
        { label: "أتعاب التخدير (العملية)", value: "مدمَجة في الباقة الجراحية" },
        { label: "تخدير فوق الجافية للولادة", value: "1 500 – 4 000 درهم" },
      ],
      note: "أسعار إرشادية (2026). تتكفّل CNSS وAMO جزئيًّا بأعمال التخدير في إطار ملف الاستشفاء.",
    },
  },

  "biologie-medicale": {
    description:
      "البيولوجي الطبي يدير مختبر التحاليل الطبية ويضمن موثوقية الفحوص البيولوجية: سحب الدم، تحاليل البول، الموازين الهرمونية، الفحوص المصلية، الفحوص الميكروبيولوجية. وهذه التحاليل، الموصوفة غالبًا من طبيب، أساسية لوضع تشخيص أو الكشف عن مرض أو مراقبة علاج (السكري، الكوليسترول، وظيفة الكلى، العدوى). ولا يُستشار البيولوجي كطبيب سريري: يُتوجَّه إلى المختبر مع الوصفة، على الريق إذا تطلّب الفحص ذلك. ويصادق البيولوجي على النتائج، ويفسّرها تقنيًّا، وينبّه الطبيب الواصف عند قيمة حرجة. وبالمغرب، مختبرات التحاليل كثيرة ومتاحة في جميع المدن. ويمكن إجراء بعض الفحوص البسيطة (السكر في الدم، الزمرة الدموية) دون وصفة، لكن التفسير الطبي يبقى من اختصاص طبيبك.",
    quandConsulter: [
      "تحليل دموي موصوف من طبيبك",
      "متابعة مرض مزمن (السكري، الكوليسترول)",
      "البحث عن عدوى (فحص مصلي، عيّنة)",
      "فحص الحمل أو فحص ما قبل العملية",
      "مراقبة وظيفة الكلى أو الكبد أو الغدة الدرقية",
    ],
    faqs: [
      { q: "هل تلزم وصفة لإجراء تحاليل؟", a: "تُجرى معظم التحاليل بوصفة طبية، وهي ضرورية أيضًا للاسترجاع. ويمكن إجراء بعض الفحوص البسيطة دون وصفة، لكن يجب إسناد تفسيرها إلى طبيبك." },
      { q: "كم يكلّف تحليل دموي بالمغرب؟", a: "يكلّف سحب الدم البسيط بضع عشرات من الدراهم لكل معطى؛ ويرجع فحص دموي عادي (السكر، الكوليسترول، تعداد الدم) عمومًا إلى 150 إلى 500 درهم حسب التحاليل المطلوبة. ويستفيد المؤمَّنون لدى CNSS أو AMO من استرجاع جزئي بوصفة." },
      { q: "هل يجب أن أكون على الريق لسحب الدم؟", a: "يتوقّف ذلك على التحاليل: يتطلّب السكر في الدم والميزان الدهني صيامًا من 8 إلى 12 ساعة، وأخرى لا. ويُبلِغك المختبر بالشروط الدقيقة عند حجز الموعد." },
      { q: "كيف أجد مختبر تحاليل بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « البيولوجيا الطبية » ومدينتك لإيجاد مختبر أو بيولوجي، والاطّلاع على الآراء وتنظيم عيّنتك، ووصفتك في يدك." },
    ],
    essentiel: [
      { value: "بوصفة", label: "التحاليل الطبية" },
      { value: "150 – 500 درهم", label: "فحص دموي عادي" },
      { value: "CNSS · AMO", label: "استرجاع جزئي" },
    ],
    sections: [
      {
        h: "ما فائدة التحاليل الطبية؟",
        body: [
          "تقيس التحاليل البيولوجية معطيات من الدم أو البول أو عيّنات أخرى لإبراز حالة الجسم: السكر، الكوليسترول، وظيفة الكلى، الهرمونات، مؤشرات العدوى أو الالتهاب.",
          "وتكمّل الفحص السريري للطبيب وهي ضرورية لتشخيص ومتابعة أمراض كثيرة جدًّا، غالبًا صامتة في بدايتها.",
        ],
      },
      {
        h: "حسن التحضير لسحب الدم",
        body: [
          "حسب التحاليل، قد يلزم صيام من 8 إلى 12 ساعة (السكر، الميزان الدهني). اشرب الماء، وأبلِغ عن أدويتك، واحترم التوقيت المنصوح به لبعض القياسات الهرمونية.",
          "ويوضّح لك المختبر الشروط عند الموعد. ويضمن تحضير جيد نتائج موثوقة ويتفادى إعادة العيّنة.",
        ],
      },
      {
        h: "فهم نتائجك",
        body: [
          "تبيّن النتائج قيمك مقابل قيم مرجعية. وقيمة خارج المعدل ليست دائمًا مقلقة: تُفسَّر حسب السياق والسنّ والجنس والفحص بأكمله.",
          "وطبيبك الواصف وحده يضع التشخيص ويقرّر السلوك الواجب. أما البيولوجي فيضمن الجودة التقنية وينبّه إلى القيم الحرجة.",
        ],
      },
      {
        h: "الكشف عن الأمراض المزمنة ومتابعتها",
        body: [
          "تؤدّي البيولوجيا دورًا أساسيًّا في الكشف عن السكري واضطرابات الكوليسترول أو وظيفة الكلى، الشائعة بالمغرب والصامتة غالبًا في البداية.",
          "وبالنسبة للأمراض المزمنة، تتيح فحوص منتظمة ضبط العلاجات والوقاية من المضاعفات. وانتظام المتابعة لا يقلّ أهمية عن العلاج نفسه.",
        ],
      },
    ],
    prix: {
      title: "كم تكلّف التحاليل الطبية بالمغرب؟",
      intro: "تتوقّف الأسعار على عدد ونوع التحاليل المطلوبة. فئات أسعار إرشادية لفحوص عادية.",
      rows: [
        { label: "سحب الدم (عمل أخذ العيّنة)", value: "30 – 80 درهم" },
        { label: "السكر في الدم على الريق", value: "30 – 60 درهم" },
        { label: "الميزان الدهني (الكوليسترول)", value: "100 – 200 درهم" },
        { label: "تعداد الدم الكامل (NFS)", value: "60 – 120 درهم" },
        { label: "فحص دموي كامل عادي", value: "150 – 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للتحاليل الموصوفة عند تقديم الوصفة.",
    },
  },

  "anatomo-pathologie": {
    description:
      "أخصائي علم الأنسجة المرضية (الباثولوجي) هو الطبيب الذي يفحص بالمجهر الأنسجة والخلايا المأخوذة من المريض — خزعات، قطع جراحية، مسحات — لوضع تشخيص دقيق. وهو تخصص أساسي لكنه قليل المعرفة لدى عامة الناس، لأن المريض لا يستشيره مباشرة: يُطلَب الفحص من الطبيب أو الجرّاح الذي أخذ العيّنة، ويرسل إليه الباثولوجي تقريره. ودوره حاسم في تشخيص السرطانات: فهو من يؤكّد طبيعة الورم (حميد أو خبيث)، ويحدّد نوعه ودرجة عدوانيته، فيوجّه بذلك العلاج. وبالمغرب، يُجرى علم الأنسجة المرضية في مختبرات متخصصة، غالبًا في المدن الكبرى. وتشترط جودة هذا التشخيص ومدته كلَّ التكفّل اللاحق، خاصة في علم الأورام.",
    quandConsulter: [
      "تحليل خزعة أجراها طبيبك",
      "فحص قطعة جراحية بعد تدخّل",
      "مسحة عنق الرحم (الكشف)",
      "تأكيد طبيعة ورم أو عقدة",
      "بحث مطلوب في إطار فحص سرطان",
    ],
    faqs: [
      { q: "هل يستشير المريض أخصائي علم الأنسجة مباشرة؟", a: "لا. يحلّل أخصائي علم الأنسجة العيّنات المُرسَلة من الطبيب أو الجرّاح ويوجّه إليه تقريره. وطبيبك هو من يشرح لك بعد ذلك النتائج والسلوك الواجب." },
      { q: "كم يكلّف فحص علم الأنسجة المرضية بالمغرب؟", a: "تتوقّف الكلفة على تعقيد التحليل: احسب عمومًا بين 300 و1 500 درهم لفحص خزعة، وأكثر إذا لزمت تقنيات تكميلية (الكيمياء النسيجية المناعية). ويستفيد المؤمَّنون لدى CNSS أو AMO من تكفّل جزئي بملف." },
      { q: "كم من الوقت للحصول على نتائج خزعة؟", a: "تتراوح المدة عمومًا من أيام إلى أسبوعين حسب التقنية والمختبر. وقد تتطلّب التحاليل المعقّدة أو المحتاجة إلى فحوص تكميلية وقتًا أطول." },
      { q: "كيف أجد مختبر علم الأنسجة المرضية بالمغرب؟", a: "على صحة بالمغرب، صفِّ حسب تخصص « علم الأنسجة المرضية » ومدينتك لتحديد مختبر متخصص. وعمليًّا، طبيبك غالبًا هو من يرسل العيّنات مباشرة." },
    ],
    essentiel: [
      { value: "على عيّنة", label: "تحليل الأنسجة/الخلايا" },
      { value: "تشخيص السرطان", label: "دور حاسم" },
      { value: "عبر الطبيب", label: "لا ولوج مباشر للمريض" },
    ],
    sections: [
      {
        h: "الدور الحاسم للباثولوجي في التشخيص",
        body: [
          "بفحص الأنسجة بالمجهر، يضع أخصائي علم الأنسجة تشخيص اليقين الذي لا يستطيع التصوير أو السريري وحدهما تقديمه. ويميّز الحميد من الخبيث ويصف الآفة بدقة.",
          "وتقريره هو القطعة الأساسية في تشخيصات كثيرة، خاصة في علم الأورام، حيث يشترط نوع العلاج المقترح.",
        ],
      },
      {
        h: "الخزعة والقطعة الجراحية والمسحة",
        body: [
          "تأخذ الخزعة جزءًا صغيرًا من النسيج للتحليل؛ وتقابل القطعة الجراحية ما أُزيل خلال تدخّل؛ وتجمع المسحة خلايا، كمسحة عنق الرحم للكشف.",
          "ويُحلَّل كلٌّ من هذه العيّنات وفق بروتوكولات دقيقة. ويمكن للباثولوجي اللجوء إلى صبغات وتقنيات خاصة لتدقيق التشخيص.",
        ],
      },
      {
        h: "علم الأنسجة المرضية وعلم الأورام",
        body: [
          "يعتمد تشخيص السرطان دائمًا تقريبًا على تحليل علم الأنسجة: نوع الورم، درجة العدوانية، حواف الاستئصال، وجود مستقبِلات تستهدفها بعض العلاجات.",
          "وتوجّه هذه المعلومات طبيب الأورام والجرّاح في اختيار الاستراتيجية العلاجية. لذا فإن جودة هذا التحليل وسرعته حاسمتان للمريض.",
        ],
      },
      {
        h: "المُدد والتقنيات التكميلية",
        body: [
          "إلى جانب الفحص العادي، تدقّق تقنيات تكميلية (الكيمياء النسيجية المناعية، البيولوجيا الجزيئية) التشخيص والحساسية لبعض العلاجات الموجّهة.",
          "وتطيل هذه التحاليل أحيانًا مدة الجواب، لكنها حاسمة لتكفّل مخصّص. ويبقيك طبيبك على اطّلاع بالتقدّم.",
        ],
      },
    ],
    prix: {
      title: "كم يكلّف فحص علم الأنسجة المرضية بالمغرب؟",
      intro: "تتوقّف الأسعار على طبيعة العيّنة والتقنيات المستعملة. فئات أسعار إرشادية.",
      rows: [
        { label: "فحص خزعة", value: "300 – 1 500 درهم" },
        { label: "فحص خلوي (مسحة)", value: "150 – 400 درهم" },
        { label: "الكيمياء النسيجية المناعية (تكميلي)", value: "ابتداءً من 500 درهم" },
      ],
      note: "أسعار إرشادية (2026). يستفيد المؤمَّنون لدى CNSS وAMO من استرجاع جزئي للفحوص الموصوفة في إطار ملف العلاج.",
    },
  },

};

const DEFAULT_CONTENT_AR: SpecialtyContentAr = {
  description: "",
  quandConsulter: [],
  faqs: [
    { q: "كيف أجد أخصائيًا بالمغرب؟", a: "تُدرج صحة بالمغرب آلاف الممارسين الموثوقين بالمغرب. صفِّ حسب التخصص والمدينة، واطّلع على آراء المرضى واحجز موعدًا عبر الإنترنت مجانًا." },
    { q: "كيف أحجز موعدًا عبر الإنترنت على صحة بالمغرب؟", a: "اختر ممارسًا، اطّلع على مواعيده المتاحة واضغط على « حجز موعد ». التأكيد فوري، دون رسوم إضافية." },
  ],
};

/** Pluralise un synonyme FR, y compris les noms composés :
 *  « médecin généraliste » → « médecins généralistes », « cardiologue » → « cardiologues ».
 *  Les mots déjà terminés par s/x/z restent inchangés. */
export function pluralizeSynonyme(syn: string): string {
  return syn
    .split(" ")
    .map((w) => (/[sxz]$/i.test(w) ? w : `${w}s`))
    .join(" ");
}

export function getSpecialtyContent(slug: string, locale: Locale = "fr"): SpecialtyContent {
  const fr = SPECIALTY_CONTENT[slug] ?? DEFAULT_CONTENT;
  if (locale === "ar") {
    const ar = SPECIALTY_CONTENT_AR[slug] ?? DEFAULT_CONTENT_AR;
    // Le synonyme reste FR (non affiché en arabe : le titrage utilise tSpecialty).
    return { synonyme: fr.synonyme, ...ar };
  }
  return fr;
}
