-- Traductions arabes : glossaire (81) + symptômes (23)
-- Lignes EXISTANTES en prod → UPDATE by slug. Sûr : COALESCE ne dé-publie jamais.
-- Ouvre l'AR (arReviewedAt) + publie le FR des fiches non encore relues (Option A).
-- Généré par scripts/export-ar-update-sql.ts

BEGIN;

-- ─── Glossaire ───
UPDATE glossary_terms SET "termAr"='السكتة الدماغية', "definitionAr"='انقطاع مفاجئ لتدفق الدم إلى جزء من الدماغ، بسبب جلطة دموية أو نزيف. إنها حالة طارئة قصوى: شلل أو تنميل في أحد جانبي الجسم، اضطراب في الكلام، أو انحراف في الوجه تستوجب الاتصال بالإسعاف فورًا. التدخل السريع يحفظ الدماغ.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='avc';
UPDATE glossary_terms SET "termAr"='حب الشباب', "definitionAr"='مرض جلدي شائع جدًا في مرحلة المراهقة، مرتبط بالغدد الدهنية، ويتجلى في ظهور بثور ورؤوس سوداء خاصة على الوجه. توجد علاجات فعّالة؛ ويُفيد استشارة طبيب الأمراض الجلدية في الحالات المنتشرة أو المسبِّبة للندبات.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='acne';
UPDATE glossary_terms SET "termAr"='فقر الدم', "definitionAr"='انخفاض في مستوى الهيموغلوبين في الدم، مما يقلل من نقل الأكسجين. ويتجلى في التعب والشحوب وضيق التنفس. والسبب الأكثر شيوعًا هو نقص الحديد. ويؤكد تحليل الدم التشخيص ويبحث عن سببه.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='anemie';
UPDATE glossary_terms SET "termAr"='التخدير', "definitionAr"='إزالة مؤقتة للألم أثناء إجراء طبي أو جراحي. وقد يكون موضعيًا (منطقة محدودة)، أو ناحيًا (طرف من الجسم)، أو عامًا (فقدان مُتحكَّم فيه للوعي). وتقيّم استشارة سابقة المخاطرَ وتلائم التقنية المناسبة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='anesthesie';
UPDATE glossary_terms SET "termAr"='مضاد الالتهاب (مضادات الالتهاب غير الستيرويدية)', "definitionAr"='دواء يقلل من الالتهاب والألم والحمى (مثل الإيبوبروفين). وهو فعّال لكنه ليس بلا مخاطر، إذ قد يهيّج المعدة ويؤثر على الكليتين. ويُستعمل بأقل جرعة ولأقصر مدة ممكنة، مع احترام موانع الاستعمال.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='anti-inflammatoire';
UPDATE glossary_terms SET "termAr"='المضاد الحيوي', "definitionAr"='دواء يقضي على البكتيريا أو يوقف تكاثرها. وهو غير فعّال ضد الفيروسات (الزكام، الإنفلونزا). ويؤدي الاستعمال غير المناسب إلى المقاومة البكتيرية: لذا يجب تناوله فقط بوصفة طبية وطوال المدة المحددة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='antibiotique';
UPDATE glossary_terms SET "termAr"='مضاد التخثر', "definitionAr"='دواء يبطّئ تخثر الدم للوقاية من الجلطات أو علاجها (التهاب الوريد، الانصمام، بعض اضطرابات النظم). وهو يزيد من خطر النزيف ويستلزم متابعة والالتزام الصارم بالجرعات الموصوفة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='anticoagulant';
UPDATE glossary_terms SET "termAr"='مضاد الاكتئاب', "definitionAr"='دواء يُستعمل لعلاج الاكتئاب وبعض اضطرابات القلق. ويستغرق مفعوله عدة أسابيع حتى يظهر. ولا يجب إيقافه فجأة أو تناوله دون متابعة طبية، وذلك بالإضافة إلى رعاية شاملة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='antidepresseur';
UPDATE glossary_terms SET "termAr"='مضاد الهيستامين', "definitionAr"='دواء يخفف من أعراض الحساسية (العطس، سيلان الأنف، الحكة، الشرى) عن طريق إيقاف مفعول الهيستامين. وقد يسبب بعضها النعاس؛ اتّبع نصائح الصيدلي أو الطبيب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='antihistaminique';
UPDATE glossary_terms SET "termAr"='خافض ضغط الدم', "definitionAr"='مجموعة من الأدوية تهدف إلى خفض ضغط الدم المرتفع جدًا وتقليل خطر الاحتشاء والسكتة الدماغية. وتوجد عدة أصناف تُدمج غالبًا معًا. والعلاج عادةً طويل الأمد، حتى في غياب أي عرض.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='antihypertenseur';
UPDATE glossary_terms SET "termAr"='الشريان', "definitionAr"='وعاء دموي ينقل الدم من القلب إلى الأعضاء. وتتميز الشرايين بجدار سميك ومرن يتحمل ضغط الدم. ويؤدي تضيّقها بسبب الترسبات (تصلب الشرايين) إلى الاحتشاء والعديد من السكتات الدماغية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='artere';
UPDATE glossary_terms SET "termAr"='الفصال العظمي (خشونة المفاصل)', "definitionAr"='تآكل تدريجي للغضروف الذي يغطي أطراف العظام في المفصل، مما يسبب الألم والتيبّس وفقدان الحركة. ويصيب خاصة الركبتين والوركين واليدين، ويتفاقم مع التقدم في السن. وتجمع الرعاية بين التمارين ومسكّنات الألم وأحيانًا الجراحة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='arthrose';
UPDATE glossary_terms SET "termAr"='التأمين الإجباري عن المرض', "definitionAr"='نظام التغطية الصحية الأساسية بالمغرب، الذي يعوّض جزءًا من العلاجات والاستشارات والأدوية والاستشفاء وفق تعريفات مرجعية. ويُدار خاصة من طرف الصندوق الوطني للضمان الاجتماعي؛ ويتوقف الباقي على عاتق المريض على التغطية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='amo';
UPDATE glossary_terms SET "termAr"='الربو', "definitionAr"='مرض التهابي مزمن في الشعب الهوائية يسبب نوبات من ضيق التنفس والصفير والسعال، غالبًا ليلاً أو أثناء المجهود. وتُحفَّز النوبات بمسببات الحساسية أو المجهود أو العدوى. ويعتمد العلاج على أجهزة الاستنشاق الوقائية والإسعافية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='asthme';
UPDATE glossary_terms SET "termAr"='الخزعة', "definitionAr"='أخذ جزء صغير من نسيج بهدف تحليله تحت المجهر. وهي الفحص المرجعي لتحديد طبيعة آفة ما، خاصة لتأكيد وجود سرطان أو استبعاده.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='biopsie';
UPDATE glossary_terms SET "termAr"='التهاب الشعب الهوائية', "definitionAr"='التهاب في الشعب الهوائية، فيروسي في الغالب وحميد، يتجلى في سعال أحيانًا مصحوب بالبلغم، وضيق في الصدر وتعب. ويشفى عادةً من تلقاء نفسه في أسبوع إلى أسبوعين؛ ويستوجب السعال المستمر أو الحمى المرتفعة استشارة طبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='bronchite';
UPDATE glossary_terms SET "termAr"='سرطان الثدي', "definitionAr"='ورم خبيث يتطور انطلاقًا من خلايا الثدي. وهو السرطان الأكثر شيوعًا لدى النساء. وإذا اكتُشف مبكرًا، خاصة عبر الكشف المبكر (تصوير الثدي الشعاعي) والفحص الذاتي، يُعالَج بحظوظ جيدة للشفاء. ويجب عرض أي كتلة أو تغيّر في الثدي على طبيب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='cancer-du-sein';
UPDATE glossary_terms SET "termAr"='الماء الأبيض (السّاد)', "definitionAr"='تعتيم تدريجي لعدسة العين، يؤدي إلى انخفاض في الرؤية والانبهار بالضوء وبهتان الألوان. وهو شائع جدًا مع التقدم في السن، ويُعالَج بعملية جراحية شائعة تستبدل العدسة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='cataracte';
UPDATE glossary_terms SET "termAr"='الصداع', "definitionAr"='ألم يُشعر به في منطقة الرأس أو مؤخرة العنق. وهو حميد في الغالب (توتر، تعب)، لكنه قد يشير أحيانًا إلى سبب يستوجب البحث. ويستدعي الصداع المفاجئ أو غير المعتاد أو المصحوب بحمى أو قيء أو اضطرابات عصبية استشارة سريعة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='cephalee';
UPDATE glossary_terms SET "termAr"='العلاج الكيميائي', "definitionAr"='علاج دوائي للسرطان يهدف إلى تدمير الخلايا السرطانية أو كبح تكاثرها. ويُعطى على شكل جلسات، وقد يسبب آثارًا جانبية (تعب، غثيان، تساقط الشعر) يمكن التحكم فيها مع الفريق الطبي المعالج.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='chimiotherapie';
UPDATE glossary_terms SET "termAr"='القلب', "definitionAr"='عضو عضلي يضخ الدم في جميع أنحاء الجسم بفضل تقلصات منتظمة. ويتكون من أربع حجرات ويضمن دوران الأكسجين نحو الأعضاء. وتُعد أمراضه من بين الأسباب الأولى للوفاة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='coeur';
UPDATE glossary_terms SET "termAr"='تنظير القولون', "definitionAr"='فحص يستكشف داخل الأمعاء الغليظة بواسطة كاميرا مرنة، عادةً تحت التخدير. ويمكّن من كشف وإزالة الزوائد اللحمية والكشف المبكر عن سرطان القولون والمستقيم. ويستلزم تحضيرًا لتفريغ الأمعاء في اليوم السابق.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='coloscopie';
UPDATE glossary_terms SET "termAr"='التهاب الملتحمة', "definitionAr"='التهاب في الغشاء الذي يغطي العين، فيروسي أو بكتيري أو تحسّسي المنشأ، يسبب احمرارًا ودمعانًا وإحساسًا بوجود حبيبات رمل. وهو حميد في الغالب؛ ويستوجب الألم الشديد أو انخفاض الرؤية استشارة طبيب العيون.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='conjonctivite';
UPDATE glossary_terms SET "termAr"='الكورتيكويد', "definitionAr"='دواء مضاد للالتهاب قوي مشتق من هرمون طبيعي، يُستعمل في العديد من الأمراض الالتهابية والتحسّسية. ويعرّض العلاج المطوّل لآثار جانبية ولا يجب أبدًا إيقافه فجأة دون استشارة طبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='corticoide';
UPDATE glossary_terms SET "termAr"='التهاب المثانة', "definitionAr"='عدوى في المثانة، شائعة لدى النساء، تسبب حرقة أثناء التبول ورغبات متكررة وملحّة وأحيانًا وجود دم في البول. ويجب أن تدفع الحمى أو ألم الظهر المصاحبان إلى استشارة طبية (خطر إصابة الكلية).', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='cystite';
UPDATE glossary_terms SET "termAr"='الكشف المبكر', "definitionAr"='البحث عن مرض لدى شخص لا تظهر عليه أعراض، بهدف اكتشافه مبكرًا وتحسين حظوظ الشفاء. ويعتمد على فحوص بسيطة ومحددة (مثل تصوير الثدي الشعاعي، سكر الدم، ضغط الدم) تُقترح حسب السن وعوامل الخطر.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='depistage';
UPDATE glossary_terms SET "termAr"='الاكتئاب', "definitionAr"='اضطراب نفسي شائع يتميز بحزن مستمر وفقدان الاهتمام والمتعة لمدة أسبوعين على الأقل، مع تعب واضطرابات في النوم والشهية. وهو ليس ضعفًا: بل مرض يُعالَج بالعلاج النفسي، وعند الحاجة، بالأدوية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='depression';
UPDATE glossary_terms SET "termAr"='داء السكري من النوع الثاني', "definitionAr"='مرض مزمن يتميّز بارتفاع نسبة السكر في الدم بسبب مقاومة الجسم للأنسولين. يظهر غالباً في سنّ الرشد ويزيد من خطره الوزن الزائد وقلة الحركة. وإذا لم يُضبط، فإنه يُلحق الضرر بالعينين والكليتين والأعصاب والقلب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='diabete-type-2';
UPDATE glossary_terms SET "termAr"='ضيق التنفس', "definitionAr"='إحساس بالانزعاج أو صعوبة في التنفس، قد يظهر عند بذل مجهود أو أثناء الراحة. وقد يكون سببه تنفسيًا أو قلبيًا. إن ضيق التنفس الذي يظهر فجأة أو أثناء الراحة علامة إنذار تستوجب استشارة طبية دون تأخير.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='dyspnee';
UPDATE glossary_terms SET "termAr"='التصوير بالصدى (الإيكوغرافيا)', "definitionAr"='تقنية تصوير تستعمل الموجات فوق الصوتية لرؤية الأعضاء في الوقت الفعلي، دون أشعة سينية. وهي غير مؤلمة وبلا خطر معروف، وتستكشف بوجه خاص البطن والقلب والأوعية الدموية والجنين خلال الحمل.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='echographie';
UPDATE glossary_terms SET "termAr"='الإكزيما', "definitionAr"='مرض التهابي في الجلد، غير معدٍ، يسبب بقعًا حمراء وجافة وحكة. يتطور على شكل نوبات وهو شائع عند الأطفال. تجمع العناية بين ترطيب الجلد وعلاج النوبات.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='eczema';
UPDATE glossary_terms SET "termAr"='الأثر الجانبي', "definitionAr"='أثر غير مرغوب فيه لدواء ما، يضاف إلى مفعوله المنتظر. ويتراوح من الخفيف (نعاس، غثيان) إلى الخطير (حساسية). يجب الإبلاغ عن كل أثر غير معتاد للطبيب أو الصيدلي؛ وبعضها يستوجب إيقاف العلاج.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='effet-secondaire';
UPDATE glossary_terms SET "termAr"='تخطيط كهربية القلب (ECG)', "definitionAr"='فحص بسيط وغير مؤلم يسجل النشاط الكهربائي للقلب بواسطة أقطاب توضع على الجلد. يساعد على كشف اضطرابات النظم وعلامات الاحتشاء وغيرها من الاضطرابات القلبية. يستغرق بضع دقائق ولا يتطلب أي تحضير خاص.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='electrocardiogramme';
UPDATE glossary_terms SET "termAr"='التنظير الداخلي', "definitionAr"='فحص يستكشف داخل عضو مجوف بواسطة كاميرا مرنة (منظار داخلي). يستكشف تنظير المعدة المعدةَ، ويستكشف تنظير القولون القولونَ. يتيح الرؤية وأخذ العينات وأحيانًا العلاج، غالبًا تحت تخدير خفيف.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='endoscopie';
UPDATE glossary_terms SET "termAr"='الصرع', "definitionAr"='مرض عصبي يتميز بتكرار نوبات مرتبطة بنشاط كهربائي غير طبيعي في الدماغ. تتخذ النوبات أشكالًا متعددة (تشنجات، غيابات). ويتيح العلاج المناسب لأغلب المصابين التحكم في نوباتهم.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='epilepsie';
UPDATE glossary_terms SET "termAr"='اختبار الجهد', "definitionAr"='تسجيل لنشاط القلب أثناء بذل مجهود تدريجي (على دراجة أو جهاز مشي)، تحت مراقبة طبية. يساعد على كشف مرض في شرايين القلب وعلى تقييم مدى تحمل المجهود.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='epreuve-d-effort';
UPDATE glossary_terms SET "termAr"='الحمى', "definitionAr"='ارتفاع درجة حرارة الجسم فوق 38 درجة مئوية، وهو في الغالب رد فعل من الجسم على عدوى. ليست الحمى مرضًا في حد ذاتها بل إشارة. والحمى المرتفعة أو المستمرة أو التي تصيب رضيعًا تستوجب استشارة طبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='fievre';
UPDATE glossary_terms SET "termAr"='الكبد', "definitionAr"='عضو ضخم يقع تحت الأضلاع في الجهة اليمنى، أساسي للهضم وتخزين الطاقة وصنع البروتينات والتخلص من السموم. وقد يصاب بالتهابات الكبد أو بسبب الكحول أو بتراكم الدهون فيه.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='foie';
UPDATE glossary_terms SET "termAr"='مسحة عنق الرحم', "definitionAr"='أخذ عينة من خلايا عنق الرحم، وهو غير مؤلم، يستعمل للكشف المبكر عن الآفات التي قد تتطور نحو سرطان عنق الرحم. ويُنصح به بشكل منتظم عند المرأة، وفق وتيرة يحددها الطبيب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='frottis';
UPDATE glossary_terms SET "termAr"='التهاب المعدة والأمعاء', "definitionAr"='التهاب في الجهاز الهضمي، فيروسي في الغالب، يسبب إسهالًا وتقيؤًا وآلامًا في البطن وأحيانًا حمى. وهو حميد ويزول تلقائيًا، لكنه يعرّض بوجه خاص لخطر الجفاف: والأساس هو الترطيب الجيد.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='gastro-enterite';
UPDATE glossary_terms SET "termAr"='الزَّرَق (الغلوكوما)', "definitionAr"='مرض في العين مرتبط في الغالب بارتفاع مفرط في الضغط داخل العين، يتلف العصب البصري تدريجيًا وقد يؤدي إلى العمى. يبقى صامتًا لمدة طويلة، ويُكشف عنه بفحص طبي منتظم للعيون بعد سن معينة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='glaucome';
UPDATE glossary_terms SET "termAr"='نسبة السكر في الدم', "definitionAr"='معدل الغلوكوز (السكر) الموجود في الدم، يُقاس بتحليل دم أو بجهاز قياس. وهو المؤشر الأساسي للكشف عن مرض السكري ومراقبته. تكون نسبة السكر الطبيعية على الريق أقل من 1,10 غ/ل عمومًا.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='glycemie';
UPDATE glossary_terms SET "termAr"='داء النقرس', "definitionAr"='شكل من التهاب المفاصل ناتج عن تراكم بلورات حمض البوليك في مفصل ما، يسبب نوبات مفاجئة من ألم شديد، غالبًا في إبهام القدم. ويشجع الغذاء والكحول وبعض الأدوية على النوبات، التي يمكن الوقاية منها بعلاج أساسي.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='goutte';
UPDATE glossary_terms SET "termAr"='الإنفلونزا', "definitionAr"='عدوى تنفسية فيروسية معدية سببها فيروسات الإنفلونزا، تتميز بحمى مفاجئة وآلام في العضلات وإرهاق وسعال. وهي حميدة في الغالب، لكنها قد تكون خطيرة عند الأشخاص الهشين. والتلقيح السنوي هو الوسيلة الرئيسية للوقاية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='grippe';
UPDATE glossary_terms SET "termAr"='التهاب الكبد B', "definitionAr"='عدوى تصيب الكبد سببها فيروس التهاب الكبد B، وتنتقل عبر الدم والسوائل الحيوية. وهي صامتة في الغالب، وقد تصبح مزمنة وتتطور نحو تشمع الكبد أو سرطان الكبد. ويمكن تفاديها بالتلقيح.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='hepatite-b';
UPDATE glossary_terms SET "termAr"='الانزلاق الغضروفي', "definitionAr"='بروز قرص يقع بين فقرتين، قد يضغط على عصب ويسبب ألمًا يمتد إلى أحد الأطراف (كعرق النسا مثلًا). تتطور أغلب الحالات نحو التحسن دون جراحة، مع راحة نسبية ومسكنات وإعادة التأهيل.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='hernie-discale';
UPDATE glossary_terms SET "termAr"='ارتفاع ضغط الدم الشرياني', "definitionAr"='ارتفاع مستمر في ضغط الدم داخل الشرايين، يُحدَّد ابتداءً من 140/90 ملم زئبق في العيادة. وهو غالبًا بلا أعراض، ويزيد من خطر الاحتشاء والسكتة الدماغية والقصور الكلوي. ويُكشف عنه بقياس بسيط، ويُتحكم فيه بنمط عيش صحي، وعند الحاجة بأدوية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='hypertension-arterielle';
UPDATE glossary_terms SET "termAr"='انخفاض السكر في الدم', "definitionAr"='انخفاض غير طبيعي في معدل السكر في الدم، شائع عند الأشخاص المصابين بالسكري والمعالَجين. يسبب تعرقًا ورعشة وجوعًا وخفقانًا وتشوشًا. ويُصحَّح بتناول سريع للسكر؛ أما الأشكال الحادة فهي حالة طارئة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='hypoglycemie';
UPDATE glossary_terms SET "termAr"='قصور الغدة الدرقية', "definitionAr"='إنتاج غير كافٍ للهرمونات من طرف الغدة الدرقية، يؤدي إلى إرهاق وزيادة في الوزن والشعور بالبرد وتباطؤ وجفاف الجلد. ويُشخَّص بتحليل دم (TSH) ويُعالج بتناول يومي لهرمون درقي مُصنَّع.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='hypothyroidie';
UPDATE glossary_terms SET "termAr"='اليرقان', "definitionAr"='اصفرار لون الجلد وبياض العينين، ناتج عن فائض من البيليروبين في الدم. وقد يدل على إصابة في الكبد أو في القنوات الصفراوية. وعند البالغ، يستوجب اليرقان دائمًا استشارة طبية للبحث عن سببه.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='ictere';
UPDATE glossary_terms SET "termAr"='مؤشر كتلة الجسم (IMC)', "definitionAr"='النسبة بين الوزن والطول (الوزن بالكيلوغرام مقسومًا على مربع الطول بالمتر) التي تستعمل لتقدير البنية الجسمية. يُعتبر مؤشر كتلة الجسم بين 18,5 و25 عاديًا؛ وفوق 30 نتحدث عن السمنة. وهو مرجع وليس تشخيصًا.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='imc';
UPDATE glossary_terms SET "termAr"='احتشاء عضلة القلب', "definitionAr"='تلف جزء من عضلة القلب المحروم من الدم بسبب انسداد شريان من شرايين القلب. ويظهر غالبًا بألم شديد ضاغط في الصدر، يمتد نحو الذراع أو الفك. وهو حالة طارئة تهدد الحياة: يجب الاتصال بالإسعاف دون انتظار.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='infarctus-du-myocarde';
UPDATE glossary_terms SET "termAr"='قصور القلب', "definitionAr"='عجز القلب عن ضخ ما يكفي من الدم لحاجات الجسم. يسبب ضيقًا في التنفس وإرهاقًا وتورمًا في الساقين. وهو مزمن، ويُتحكم فيه بالأدوية وتقليل الملح والمتابعة المنتظمة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='insuffisance-cardiaque';
UPDATE glossary_terms SET "termAr"='الأنسولين', "definitionAr"='هرمون يتيح للسكر المرور من الدم نحو الخلايا. ويُعطى عن طريق الحقن، وهو لا غنى عنه في السكري من النوع الأول، وضروري أحيانًا في النوع الثاني. وتُضبط الجرعات حسب الغذاء ونسبة السكر في الدم.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='insuline';
UPDATE glossary_terms SET "termAr"='التصوير بالرنين المغناطيسي', "definitionAr"='فحص تصويري يستخدم مجالًا مغناطيسيًا قويًا، دون أشعة سينية، لإنتاج صور مفصّلة للأنسجة الرخوة: الدماغ والمفاصل والنخاع والأعضاء. يُجرى داخل نفق ويدوم من 15 إلى 45 دقيقة. ويجب الإبلاغ عن أيّ أجسام معدنية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='irm';
UPDATE glossary_terms SET "termAr"='العلاج الطبيعي (الترويض الطبي)', "definitionAr"='مجموعة من التقنيات اليدوية والتمارين تهدف إلى استعادة الحركة والوظيفة (بعد إصابة أو عملية أو في مرض مزمن). يقوم بها أخصائي العلاج الطبيعي، غالبًا بناءً على وصفة طبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='kinesitherapie';
UPDATE glossary_terms SET "termAr"='تصوير الثدي بالأشعة', "definitionAr"='تصوير بالأشعة للثديين يُستخدم للكشف المبكّر عن سرطان الثدي، قبل ظهور أيّ عرض. يُنصح به في إطار الكشف المبكّر ابتداءً من سنّ معيّنة، ويتيح رصد اختلالات صغيرة جدًّا في الحجم.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='mammographie';
UPDATE glossary_terms SET "termAr"='الشقيقة (الصداع النصفي)', "definitionAr"='صداع متكرّر، غالبًا في جانب واحد، نابض وشديد، يتفاقم بالمجهود ويصحبه غثيان أو انزعاج من الضوء والضجيج. تدوم النوبات من بضع ساعات إلى ثلاثة أيام. وتوجد علاجات للنوبة وأخرى وقائية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='migraine';
UPDATE glossary_terms SET "termAr"='السمنة', "definitionAr"='تراكم مفرط للدهون في الجسم يضرّ بالصحة، ويُعرَّف بمؤشر كتلة جسم يساوي أو يتجاوز 30. تزيد السمنة من خطر الإصابة بالسكري وارتفاع ضغط الدم وأمراض القلب. يجمع علاجها بين التغذية والنشاط البدني والمتابعة الطبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='obesite';
UPDATE glossary_terms SET "termAr"='الوذمة (الاستسقاء)', "definitionAr"='تراكم للسوائل في الأنسجة يسبّب تورّمًا، غالبًا في الساقين أو الكاحلين. أسبابها متعدّدة (الوقوف المطوّل، أسباب وريدية أو قلبية أو كلوية). الوذمة المفاجئة أو المؤلمة أو التي تصيب جانبًا واحدًا تستوجب استشارة الطبيب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='oedeme';
UPDATE glossary_terms SET "termAr"='الوصفة الطبية', "definitionAr"='وثيقة يحرّرها مهني صحي مرخّص، تُدرج فيها الأدوية أو العلاجات الموصوفة وجرعاتها ومدّتها. وهي ضرورية لصرف العديد من الأدوية، وتتيح متابعة العلاجات واسترجاع نفقاتها.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='ordonnance';
UPDATE glossary_terms SET "termAr"='هشاشة العظام', "definitionAr"='ضعف في العظام ناتج عن فقدان الكثافة العظمية، ما يزيد خطر الكسور، خصوصًا بعد سنّ اليأس ومع تقدّم العمر. غالبًا ما تكون صامتة إلى حين حدوث الكسر، وتُتَّقى بالنشاط البدني وتناول كمية كافية من الكالسيوم وفيتامين د، وأحيانًا بالأدوية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='osteoporose';
UPDATE glossary_terms SET "termAr"='الخفقان', "definitionAr"='إحساس غير طبيعي بضربات القلب، تُشعَر بها سريعة أو قوية أو غير منتظمة. غالبًا ما تكون حميدة (التوتر، الكافيين، المجهود)، لكنها قد تعكس أحيانًا اضطرابًا في نظم القلب وتستدعي إجراء تخطيط كهربائي للقلب إذا تكرّرت.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='palpitations';
UPDATE glossary_terms SET "termAr"='الالتهاب الرئوي', "definitionAr"='عدوى تصيب رئة واحدة أو كلتيهما، غالبًا بكتيرية أو فيروسية، تسبّب الحمّى والسعال وضيق التنفّس وألمًا في الصدر. قد تكون خطيرة عند الطفل أو المسنّ أو الشخص الهشّ، وتستوجب استشارة طبية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='pneumonie';
UPDATE glossary_terms SET "termAr"='الرئتان', "definitionAr"='عضوا التنفّس الموجودان في الصدر، حيث ينتقل الأكسجين من الهواء إلى الدم ويُطرَح ثاني أكسيد الكربون. يُعدّ التدخين والعدوى والتلوّث من أبرز ما يهاجمهما.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='poumons';
UPDATE glossary_terms SET "termAr"='سحب الدم (التحليل الدموي)', "definitionAr"='أخذ عيّنة من الدم، غالبًا من ثنية المرفق، بهدف تحليل عدّة مؤشّرات: سكر الدم والكوليسترول وتعداد الدم ووظيفة الكبد والكليتين. تتطلّب بعض التحاليل الصيام؛ اتّبع تعليمات المختبر.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='prise-de-sang';
UPDATE glossary_terms SET "termAr"='البروستاتا', "definitionAr"='غدّة في الجهاز التناسلي الذكري تقع تحت المثانة وتشارك في إنتاج السائل المنوي. غالبًا ما يزداد حجمها مع تقدّم العمر، ما قد يعيق التبوّل ويستدعي متابعة عند طبيب المسالك البولية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='prostate';
UPDATE glossary_terms SET "termAr"='الصدفية', "definitionAr"='مرض التهابي مزمن في الجلد، غير مُعدٍ، يتجلّى بلويحات حمراء مغطّاة بقشور بيضاء، غالبًا على المرفقين والركبتين وفروة الرأس. يتطوّر على شكل نوبات ويستفيد من علاجات موضعية أو عامة بحسب شدّته.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='psoriasis';
UPDATE glossary_terms SET "termAr"='التصوير بالأشعة السينية', "definitionAr"='فحص تصويري يستخدم الأشعة السينية لرؤية العظام وبعض الأعضاء (الرئتين خصوصًا). سريع وغير مؤلم، ويعرّض لجرعة ضعيفة من الإشعاع. ويُنصح بتجنّبه أثناء الحمل إلا عند الضرورة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='radiographie';
UPDATE glossary_terms SET "termAr"='العلاج الإشعاعي', "definitionAr"='علاج للسرطان يستخدم الإشعاعات لتدمير الخلايا الورمية مع الحفاظ قدر الإمكان على الأنسجة المجاورة. يُقدَّم على شكل جلسات، غالبًا غير مؤلمة، يخطّط لها فريق متخصّص.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='radiotherapie';
UPDATE glossary_terms SET "termAr"='الارتجاع المعدي المريئي', "definitionAr"='صعود محتوى المعدة الحمضي نحو المريء، ما يسبّب حرقة خلف عظمة القص وقلسًا، غالبًا بعد الوجبات أو في وضعية الاستلقاء. تخفّف تدابير نمط الحياة والأدوية المخفّضة للحموضة معظم الحالات.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='reflux-gastro-oesophagien';
UPDATE glossary_terms SET "termAr"='الكلية', "definitionAr"='عضو مزدوج على شكل حبّة فاصولياء يرشّح الدم لطرح الفضلات وفائض الماء على شكل بول. كما تنظّم الكليتان ضغط الدم وتوازن الأملاح المعدنية. ويؤدّي عجزهما إلى القصور الكلوي.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='rein';
UPDATE glossary_terms SET "termAr"='التصوير المقطعي المحوسب (السكانير)', "definitionAr"='فحص تصويري بالأشعة السينية يعيد بناء صور مقطعية للجسم. سريع ودقيق، ويستكشف عدّة أعضاء وحالات طارئة. تُحقن أحيانًا مادّة تباين يودية لرؤية الأوعية والأنسجة بشكل أفضل.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='scanner';
UPDATE glossary_terms SET "termAr"='عرق النسا', "definitionAr"='ألم يتبع مسار العصب الوركي، من الأرداف إلى الساق، وغالبًا ما ينتج عن ضغط جذر عصبي (انزلاق غضروفي). يشفى عادة خلال بضعة أسابيع؛ لكن فقدان القوة أو اضطرابات التبوّل تستوجب استشارة عاجلة.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='sciatique';
UPDATE glossary_terms SET "termAr"='تسرّع القلب', "definitionAr"='تسارع نظم القلب فوق 100 نبضة في الدقيقة أثناء الراحة. قد يكون طبيعيًا (المجهود، الانفعال، الحمّى) أو يعكس اضطرابًا في النظم. تسرّع القلب الذي يصعب تحمّله، مع دوار أو ألم في الصدر، يستوجب استشارة الطبيب.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='tachycardie';
UPDATE glossary_terms SET "termAr"='الاستشارة الطبية عن بُعد', "definitionAr"='استشارة طبية تُجرى عن بُعد، عبر الفيديو أو الهاتف، بين المريض ومهني صحي. تناسب العديد من الحالات غير الطارئة، لكنها لا تغني عن الفحص السريري عند الحاجة إليه.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='teleconsultation';
UPDATE glossary_terms SET "termAr"='الغدّة الدرقية', "definitionAr"='غدّة تقع في قاعدة العنق على شكل فراشة، تنتج هرمونات تنظّم الأيض (الطاقة والوزن والحرارة). ويؤثّر اختلال وظيفتها (قصورها أو فرط نشاطها) على الجسم بأكمله.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='thyroide';
UPDATE glossary_terms SET "termAr"='السلّ (الدرن)', "definitionAr"='مرض معدٍ تسبّبه بكتيريا (عصية كوخ) تصيب الرئتين خصوصًا، وينتقل عن طريق الهواء. يتجلّى بسعال مطوّل وحمّى وتعرّق ليلي ونقص في الوزن. ويُشفى بعلاج بالمضادات الحيوية طويل الأمد ومتابَع جيّدًا.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='tuberculose';
UPDATE glossary_terms SET "termAr"='اللقاح', "definitionAr"='مستحضر يدرّب الجهاز المناعي على التعرّف على عامل مُعدٍ، بهدف الوقاية من مرض قبل أيّ تعرّض له. يحمي التلقيح الفرد، وعلى المستوى الجماعي يحدّ من انتشار الأمراض المعدية.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='vaccin';
UPDATE glossary_terms SET "termAr"='الدوالي', "definitionAr"='أوردة متمدّدة وبارزة، خصوصًا في الساقين، ناتجة عن سوء عودة الدم نحو القلب. تسبّب ثقلًا وتورّمًا في الساقين. ويتيح الجورب الضاغط والنشاط البدني وعلاجات مختلفة التكفّل بها.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='varices';
UPDATE glossary_terms SET "termAr"='الدوار (الدوخة)', "definitionAr"='إحساس وهمي بالحركة، غالبًا دورانية، للذات أو للمحيط، مصحوب أحيانًا بالغثيان واضطرابات التوازن. ترتبط أسبابه كثيرًا بالأذن الداخلية، لكن الفحص يتيح استبعاد أصل عصبي.', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='vertige';

-- ─── Symptômes ───
UPDATE health_topics SET "termAr"='القلق', "shortAnswerAr"='القلق رد فعل طبيعي أمام الضغط النفسي، لكن عندما يصبح مفرطاً ومستمراً ويعيق الحياة اليومية، فقد يكون ناتجاً عن اضطراب قلق يمكن علاجه. ويتجلى في هيئة انشغالات وتوترات وعلامات جسدية (خفقان القلب، ضيق في الصدر).', "causesAr"='الضغط النفسي والإرهاق
اضطراب القلق (القلق المعمم، نوبات الهلع)
اكتئاب مصاحب
الكافيين أو المنبهات
بعض الأمراض (الغدة الدرقية) أو الأدوية', "redFlagsAr"='أفكار سوداوية أو أفكار انتحارية
نوبات هلع متكررة ومُعطِّلة
قلق يمنع من العمل أو الخروج
أعراض جسدية غير مفسَّرة وشديدة', "whenToConsultAr"='استشر الطبيب إذا كان القلق شديداً أو مستمراً أو يؤثر على حياتك. وفي حال وجود أفكار سوداوية، اطلب المساعدة دون انتظار.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='anxiete' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='حرقة عند التبول', "shortAnswerAr"='الإحساس بالحرقة عند التبول يشير في الغالب إلى التهاب في المسالك البولية، خاصة لدى المرأة. ويصاحبه رغبة متكررة ومُلِحّة في التبول. ووجود الحمى أو ألم في الظهر يغيّر طريقة التكفل (احتمال إصابة الكلية).', "causesAr"='التهاب المسالك البولية (التهاب المثانة)
عدوى منقولة جنسياً
تهيّج أو جفاف
حصوة بولية
لدى الرجل، إصابة البروستاتا', "redFlagsAr"='حمى مع ألم في الظهر أو الخاصرة
دم غزير في البول
تقيؤ مصحوب بحمى
أعراض لدى رجل أو امرأة حامل أو طفل', "whenToConsultAr"='استشر الطبيب بسرعة في حال وجود حمى أو ألم في أسفل الظهر أو حمل، أو إذا استمرت الأعراض رغم شرب كمية كافية من الماء.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='brulures-urinaires' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الإمساك', "shortAnswerAr"='الإمساك يعني تبرزاً قليل التكرار (أقل من ثلاث مرات في الأسبوع)، مع براز صلب أو صعب الإخراج. وهو شائع جداً وحميد في الغالب، ويرتبط بنمط الحياة في معظم الحالات ويتحسن بإجراءات بسيطة.', "causesAr"='نظام غذائي فقير بالألياف، شرب غير كافٍ للماء
نقص النشاط البدني
تغيير في العادات أو الإيقاع
بعض الأدوية
الضغط النفسي', "redFlagsAr"='دم في البراز
إمساك حديث ومستمر بعد سن الخمسين
نقص غير مفسَّر في الوزن مصاحب
تناوب بين الإسهال والإمساك يستقر
آلام بطنية شديدة مع انقطاع الغازات', "whenToConsultAr"='استشر الطبيب إذا كان الإمساك حديثاً وغير معتاد، أو مقاوماً للإجراءات البسيطة، أو مصحوباً بدم أو آلام أو فقدان للوزن.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='constipation' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الحكة', "shortAnswerAr"='الحكة (الحُكاك) هي رغبة في حكّ الجلد، موضعية أو منتشرة. وترتبط في الغالب بجفاف الجلد أو بمرض جلدي حميد، لكنها قد تدل نادراً على سبب عام عندما تكون منتشرة ومستمرة.', "causesAr"='جفاف الجلد
الإكزيما أو الشرى أو مرض جلدي آخر
حساسية أو لدغة
رد فعل تجاه دواء
سبب عام (الكبد، الغدة الدرقية) في حال حكة منتشرة مستمرة', "redFlagsAr"='حكة مع تورم الوجه أو صعوبة في التنفس
يرقان مصاحب
حكة معممة ومستمرة دون آفة جلدية
حمى أو تدهور في الحالة العامة', "whenToConsultAr"='استشر الطبيب إذا كانت الحكة منتشرة أو مستمرة، أو مقاومة للعناية المرطبة، أو مصحوبة بعلامات عامة.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='demangeaisons' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الإسهال', "shortAnswerAr"='الإسهال يعني تبرزاً أكثر تكراراً وأكثر سيولة من المعتاد. وهو في الغالب ذو أصل عدوائي وقصير المدة، ويُشفى تلقائياً. والأولوية هي تعويض ما يُفقد من الماء والأملاح لتفادي الجفاف.', "causesAr"='التهاب المعدة والأمعاء الفيروسي أو البكتيري
تسمم غذائي
تأثير بعض الأدوية (المضادات الحيوية)
الضغط النفسي أو متلازمة القولون العصبي
عدم تحمل غذائي', "redFlagsAr"='وجود دم أو مخاط في البراز
علامات الجفاف (عطش شديد، قلة البول، تعب)
حمى مرتفعة
إسهال يدوم أكثر من 3 أيام
ألم بطني شديد', "whenToConsultAr"='استشر الطبيب إذا دام الإسهال أكثر من 3 أيام، أو احتوى على دم، أو صاحبته حمى مرتفعة أو علامات الجفاف، خاصة لدى الطفل والمسنّ.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='diarrhee' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ألم في الصدر', "shortAnswerAr"='قد يكون لألم الصدر أسباب حميدة (عضلية أو هضمية أو قلق) كما قد تكون خطيرة (القلب، الرئتان). ومن باب الحذر، يجب اعتبار كل ألم صدري شديد أو مستمر أو غير معتاد حالة طارئة إلى أن يثبت العكس.', "causesAr"='أصل عضلي أو ضلعي (بعد مجهود أو حركة خاطئة)
الارتجاع المعدي المريئي
القلق أو نوبة هلع
سبب قلبي (الذبحة الصدرية، الاحتشاء)
سبب رئوي (الانصمام، ذات الجنب)', "redFlagsAr"='ألم يعصر الصدر، ينتشر نحو الذراع أو الفك أو الظهر
مصحوب بضيق في التنفس أو تعرق أو غثيان أو توعك
ألم شديد ومفاجئ
خفقان مع إحساس بالتوعك
صعوبة في التنفس', "whenToConsultAr"='ألم الصدر الشديد أو الضاغط أو المصحوب بضيق في التنفس أو تعرق أو انتشار نحو الذراع أو الفك يستوجب الاتصال فوراً بالإسعاف (141 / 15).', "faqJsonAr"='[{"q":"كيف نتعرف على الألم القلبي؟","a":"الألم الذي يشبه المعصرة خلف عظم القص، والمنتشر نحو الذراع الأيسر أو الفك أو الظهر، مع ضيق في التنفس أو تعرق أو توعك، يدل على سبب قلبي ويستلزم الاتصال بالإسعاف دون انتظار."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='douleur-thoracique' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ألم في الركبة', "shortAnswerAr"='ألم الركبة شائع جداً، وهو في الغالب ذو أصل ميكانيكي (رضّ، تآكل). وحسب ما إذا كان يحدث بعد صدمة أو أثناء المجهود أو في الراحة، وما إذا صاحبه تورم أم لا، يختلف السبب والتصرف الواجب.', "causesAr"='التواء أو إصابة بعد رضّ
خشونة الركبة
التهاب الأوتار أو الإرهاق الرياضي
إصابة الغضروف الهلالي
نوبة التهابية', "redFlagsAr"='ركبة مشوّهة بعد صدمة عنيفة
استحالة وضع القدم أو ثني الركبة
ركبة ساخنة وحمراء ومتورمة مع حمى
انحصار تام للمفصل', "whenToConsultAr"='استشر الطبيب في حال وجود رضّ مهم أو استحالة الاتكاء أو تورم مع حمى، أو ألم يستمر رغم الراحة.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='douleur-au-genou' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='آلام المفاصل', "shortAnswerAr"='آلام المفاصل تصيب مفصلاً واحداً أو عدة مفاصل. وقد تكون ميكانيكية (تتفاقم بالمجهود وتخفّ بالراحة) أو التهابية (تيبّس صباحي، استيقاظ ليلي). وطبيعتها ومدتها توجّهان نحو السبب.', "causesAr"='خشونة المفاصل (التآكل)
نوبة النقرس
روماتيزم التهابي
رضّ أو إرهاق
عدوى (أندر)', "redFlagsAr"='مفصل ساخن وأحمر ومؤلم جداً مع حمى
استحالة تحريك المفصل
تورم مفاجئ بعد صدمة
آلام متعددة مع حمى وتعب', "whenToConsultAr"='استشر الطبيب إذا استمر الألم أو صاحبه تورم أو احمرار أو حمى، أو حدّ من حركاتك اليومية.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='douleurs-articulaires' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='طفح جلدي', "shortAnswerAr"='الطفح الجلدي هو ظهور بثور أو احمرار أو بقع على الجلد. والأسباب عديدة: حساسية، عدوى، تهيّج. ومعظمها حميد، لكن بعض تجمعات الأعراض توجب الاستشارة بسرعة.', "causesAr"='رد فعل تحسسي (غذاء، دواء، ملامسة)
عدوى فيروسية (الجدري المائي، الحصبة...)
إكزيما أو التهاب جلدي
لدغة حشرة
الحرارة والتعرق', "redFlagsAr"='طفح مع تورم الوجه أو الشفتين أو صعوبة في التنفس
بقع حمراء أو أرجوانية لا تزول بالضغط
حمى مرتفعة مصاحبة
بثور منتشرة أو انسلاخ الجلد
إصابة الأغشية المخاطية (الفم، العينان)', "whenToConsultAr"='استشر الطبيب بسرعة إذا صاحب الطفحَ حمى أو انتشر سريعاً أو أصاب الأغشية المخاطية. وتورم الوجه أو صعوبة التنفس يستوجبان الاتصال بالإسعاف فوراً.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='eruption-cutanee' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ضيق النفس', "shortAnswerAr"='ضيق النفس هو إحساس بنقص الهواء أو بصعوبة التنفس. وعند المجهود الشديد يكون طبيعياً؛ أما في الراحة أو عند مجهود بسيط فيجب أن يثير الانتباه. وأسبابه تنفسية أو قلبية بالأساس.', "causesAr"='مجهود بدني شديد (طبيعي)
الربو أو التهاب القصبات
فقر الدم
القلق وفرط التنفس
سبب قلبي (قصور القلب)', "redFlagsAr"='ضيق نفس مفاجئ في الراحة
ازرقاق الشفتين أو الأطراف
ألم صدري مصاحب
استحالة إتمام جملة
تورم الساقين مع ضيق النفس', "whenToConsultAr"='ضيق النفس المفاجئ الظهور، أو في الراحة، أو المصحوب بألم صدري، حالة طارئة. أما ضيق النفس الذي يستقر أو يتفاقم فيبرر استشارة سريعة.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='essoufflement' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='التعب', "shortAnswerAr"='التعب إحساس بنقص الطاقة. وعندما يكون عابراً فهو أمر عادي (نقص النوم، الإرهاق). أما إذا استمر رغم الراحة فقد يكشف عن سبب طبي يجب استكشافه، مثل فقر الدم أو اضطراب في الغدة الدرقية.', "causesAr"='نقص النوم أو الإرهاق
الضغط النفسي أو القلق أو الاكتئاب
فقر الدم (نقص الحديد)
اضطراب في الغدة الدرقية
عدوى حديثة أو مزمنة', "redFlagsAr"='تعب شديد سريع الظهور وغير مفسَّر
مصحوب بفقدان مهم للوزن
ضيق في النفس أو شحوب واضح
حمى مطوّلة
تعب يمنع الأنشطة اليومية', "whenToConsultAr"='استشر الطبيب إذا استمر التعب عدة أسابيع رغم الراحة الكافية، أو صاحبته أعراض أخرى (فقدان الوزن، الشحوب، ضيق النفس). وغالباً ما يكشف تحليل الدم عن السبب.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='fatigue' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الحمى', "shortAnswerAr"='الحمى هي ارتفاع حرارة الجسم فوق 38 درجة مئوية. وهي رد فعل طبيعي للجسم، في الغالب تجاه عدوى. وليست خطيرة في حد ذاتها، لكن سياقها ومدتها يحددان التصرف الواجب.', "causesAr"='عدوى فيروسية (الزكام، الأنفلونزا، التهاب المعدة والأمعاء)
عدوى بكتيرية (التهاب اللوزتين، التهاب المسالك البولية...)
رد فعل بعد التلقيح
ضربة حر أو جفاف شديد
بزوغ الأسنان لدى الرضيع (حمى معتدلة)', "redFlagsAr"='حمى لدى رضيع أقل من 3 أشهر
حمى تفوق 40 درجة مئوية أو تدوم أكثر من 3 أيام
مصحوبة بتيبّس في الرقبة أو بقع على الجلد أو نعاس غير معتاد
صعوبة في التنفس أو جفاف (فم جاف، قلة البول)
تشنجات', "whenToConsultAr"='استشر الطبيب إذا استمرت الحمى أكثر من 3 أيام، أو كانت سيئة التحمل، أو أصابت رضيعاً أو مسنّاً أو شخصاً ناقص المناعة. وعلامات الإنذار توجب رأياً سريعاً.', "faqJsonAr"='[{"q":"ابتداءً من أي درجة حرارة نتحدث عن الحمى؟","a":"نتحدث عن الحمى ابتداءً من 38 درجة مئوية. وبين 37,5 و38 درجة، يتعلق الأمر بحُمَيّة (حمى خفيفة)."},{"q":"هل يجب خفض الحمى دائماً؟","a":"لا. الحمى المعتدلة تساعد الجسم على مقاومة العدوى. تُعالَج بالأساس إذا كانت سيئة التحمل، مع شرب كمية كافية من الماء وحسب رأي أحد المختصين في الصحة."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='fievre' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الأرق', "shortAnswerAr"='الأرق هو صعوبة في النوم، أو في الاستمرار في النوم، أو نوم غير مريح، مع تأثير على النهار. عندما يكون عرضياً فهو أمر عادي؛ أما إذا استقر فيستحق البحث عن سببه ومراجعة عادات النوم.', "causesAr"='التوتر أو القلق أو الاكتئاب
نظافة نوم سيئة (الشاشات، مواعيد غير منتظمة)
الكافيين، الكحول، الوجبات المتأخرة
ألم أو مرض آخر
بعض الأدوية', "redFlagsAr"='نعاس خطير أثناء النهار (خلف المقود)
شخير مع توقفات في التنفس (انقطاع النفس)
أرق مصحوب بضائقة نفسية
أفكار سوداء', "whenToConsultAr"='استشِر إذا استمر الأرق عدة أسابيع، أو أثّر على نهارك، أو صاحبته علامات اكتئاب أو انقطاع النفس أثناء النوم.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='insomnie' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ألم الظهر', "shortAnswerAr"='ألم الظهر، وغالباً في المنطقة القطنية، شائع جداً وحميد في أغلب الأحيان («التواء الظهر»). وهو عموماً ذو أصل عضلي أو مفصلي ويتطور نحو التحسن في بضعة أيام إلى أسابيع. يُنصح بالحفاظ على نشاط خفيف.', "causesAr"='مجهود أو حركة خاطئة أو حمل ثقيل
وضعية سيئة لمدة طويلة
خشونة أو تآكل المفاصل
انزلاق غضروفي (فتق قرصي)
التوتر والتشنجات العضلية', "redFlagsAr"='ألم بعد سقوط أو صدمة عنيفة
مصحوب بفقدان القوة أو خدر في إحدى الساقين
اضطرابات في التبول أو التبرز
حمى أو فقدان وزن غير مبرر
ألم شديد ليلاً لا يزول مع الراحة', "whenToConsultAr"='استشِر إذا استمر الألم أكثر من 4 إلى 6 أسابيع، أو ازداد سوءاً، أو صاحبته علامات إنذار (فقدان القوة، اضطرابات بولية، حمى).', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='mal-de-dos' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ألم الحلق', "shortAnswerAr"='ألم الحلق هو ألم أو تهيّج في الحلق، غالباً ما يزداد عند البلع. وهو في أغلب الأحيان ذو أصل فيروسي ويُشفى تلقائياً في بضعة أيام. بعض التهابات اللوزتين بكتيرية وقد تستلزم علاجاً.', "causesAr"='عدوى فيروسية (زكام، التهاب البلعوم)
التهاب اللوزتين البكتيري (المكورات العقدية)
الهواء الجاف، التدخين أو التهيّج
الارتجاع المعدي المريئي
الحساسية', "redFlagsAr"='صعوبة في بلع اللعاب أو في التنفس
صوت مكتوم وسيلان اللعاب (استحالة البلع)
تورم كبير في الرقبة
حمى مرتفعة مستمرة
ألم حلق في جهة واحدة فقط، شديد جداً', "whenToConsultAr"='استشِر إذا استمر ألم الحلق أكثر من 5 أيام، أو صاحبته حمى مرتفعة، أو إذا وجدت صعوبة في البلع أو التنفس. يمكن لاختبار أن يحدد ما إذا كان التهاب اللوزتين بكتيرياً.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='mal-de-gorge' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الصداع', "shortAnswerAr"='الصداع هو ألم يُحسّ به على مستوى الجمجمة أو الرقبة. وهو في أغلب الأحيان حميد (تعب، توتر، قلة النوم)، لكن بعض الخصائص يجب أن تنبّه. يتحدد سببه حسب موقعه وشدته والعلامات المصاحبة له.', "causesAr"='صداع التوتر (الإجهاد، التعب، الوضعية)
الشقيقة (الصداع النصفي)
قلة النوم، الجفاف أو تفويت وجبة
حمى أو عدوى (زكام، التهاب الجيوب)
الإفراط في استعمال الشاشات أو اضطراب بصري غير مصحّح
استهلاك الكافيين أو التوقف عنه', "redFlagsAr"='صداع مفاجئ وشديد، «الأسوأ في حياتك»
مصحوب بحمى مرتفعة وتصلب في الرقبة
مصحوب باضطرابات في النطق أو الرؤية، أو ضعف أو تشوش
بعد إصابة في الرأس
يزداد سوءاً تدريجياً على مدى عدة أيام', "whenToConsultAr"='استشِر إذا كان الصداع متكرراً، أو مقاوماً للمسكّنات المعتادة، أو تغيّرت شدته وإيقاعه. أمام أي علامة إنذار، يجب طلب الرأي الطبي فوراً.', "faqJsonAr"='[{"q":"متى يكون الصداع مقلقاً؟","a":"الصداع المفاجئ والشديد جداً، المصحوب بحمى مع تصلب في الرقبة، أو باضطرابات عصبية (النطق، الرؤية، القوة)، أو الذي يظهر بعد صدمة في الرأس، يجب أن يدفع إلى الاستشارة على وجه الاستعجال."},{"q":"أي طبيب يُستشار للصداع المتكرر؟","a":"طبيب الطب العام يقيّم الحالة في المقام الأول. في حالة الصداع المزمن أو الشقيقة، يمكنه توجيهك إلى طبيب أعصاب."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='mal-de-tete' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='ألم البطن', "shortAnswerAr"='يشير ألم البطن إلى كل ألم يُحسّ به في البطن. وهو شائع جداً وحميد في أغلب الأحيان، وقد تكون له أسباب هضمية عديدة. يوجّه موقعه وشدته والعلامات المصاحبة له نحو أصله.', "causesAr"='اضطرابات هضمية (عسر الهضم، الانتفاخ، الإمساك)
التهاب المعدة والأمعاء الفيروسي
الارتجاع المعدي المريئي أو التهاب المعدة
آلام الدورة الشهرية
التوتر ومتلازمة القولون العصبي', "redFlagsAr"='ألم شديد ومفاجئ، كطعنة سكين
بطن متصلّب، شديد الحساسية عند اللمس
مصحوب بتقيؤ متكرر أو دم في البراز
حمى مرتفعة مع ألم موضعي (مثلاً أسفل اليمين)
انعدام خروج البراز والغازات مع انتفاخ', "whenToConsultAr"='استشِر إذا كان الألم شديداً، أو استمر أكثر من 48 ساعة، أو عاد بانتظام، أو صاحبته علامات إنذار. الألم المفاجئ والشديد يستدعي رأياً على وجه الاستعجال.', "faqJsonAr"='[{"q":"متى يستلزم ألم البطن التوجه إلى المستعجلات؟","a":"الألم المفاجئ والشديد، البطن المتصلّب والمؤلم جداً، تقيؤ الدم أو وجود دم في البراز، أو ألم مع حمى موضعي في الجهة اليمنى، كلها حالات يجب أن تدفع إلى الاستشارة على وجه الاستعجال."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='mal-de-ventre' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الغثيان والتقيؤ', "shortAnswerAr"='الغثيان هو رغبة في التقيؤ، يتبعها أحياناً تقيؤ فعلي. وهو في أغلب الأحيان ذو أصل هضمي وعابر، لكنه قد يصاحب أيضاً أمراضاً أخرى. الخطر الرئيسي، خاصة عند الطفل والمسنّ، هو الجفاف.', "causesAr"='التهاب المعدة والأمعاء
تسمم أو عسر هضم غذائي
الحمل (الثلث الأول)
دوار الحركة (دوار السفر)
الشقيقة أو بعض الأدوية', "redFlagsAr"='تقيؤ دم أو ذو مظهر «تفل القهوة»
علامات الجفاف (فم جاف، قلة البول، نعاس)
تقيؤ اندفاعي مع صداع شديد
ألم بطني عنيف مصاحب
تقيؤ مستمر أكثر من 24 إلى 48 ساعة', "whenToConsultAr"='استشِر إذا استمر التقيؤ، أو منعك من الشرب، أو صاحبته علامات جفاف أو ألم شديد. وجود الدم يفرض رأياً على وجه الاستعجال.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='nausees-et-vomissements' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='فقدان الوزن غير المبرر', "shortAnswerAr"='فقدان الوزن غير الإرادي والملحوظ (مثلاً أكثر من 5٪ من الوزن خلال 6 إلى 12 شهراً)، دون حمية أو زيادة في النشاط، ليس أمراً عادياً. وهو يستدعي البحث عن سبب طبي عبر فحص شامل.', "causesAr"='اضطراب الغدة الدرقية أو داء السكري
الاكتئاب أو القلق، فقدان الشهية
مرض هضمي
عدوى مزمنة
سبب أكثر خطورة يجب استبعاده بفحص شامل', "redFlagsAr"='فقدان وزن سريع وكبير
مصحوب بحمى، أو تعرّق ليلي
دم في البراز أو البول
تعب شديد أو كتلة يمكن جسّها', "whenToConsultAr"='استشِر أمام أي فقدان وزن غير إرادي وغير مبرر: فحص شامل سيسمح بتحديد سببه.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='perte-de-poids-inexpliquee' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='نزيف الأنف (الرعاف)', "shortAnswerAr"='نزيف الأنف حميد في أغلب الأحيان ويأتي من الجزء الأمامي للحاجز الأنفي. ويتوقف عموماً عند الضغط على المنخرين. أما النزيف المتكرر أو الغزير أو الذي يحدث تحت مضادات التخثر فيجب أن يدفع إلى الاستشارة.', "causesAr"='هشاشة الأوعية، الهواء الجاف، الحكّ
الزكام أو تهيّج الأنف
ارتفاع ضغط الدم
تناول مضادات التخثر أو الأسبرين
اضطراب في التخثر (أكثر ندرة)', "redFlagsAr"='نزيف غزير لا يتوقف بعد 20 دقيقة من الضغط
نزيف متكرر وغير مبرر
تحت علاج مضاد للتخثر
شحوب، أو دوخة أو دوار مصاحب', "whenToConsultAr"='استشِر إذا لم يتوقف النزيف رغم الضغط المطوّل، أو تكرر كثيراً، أو حدث تحت مضادات التخثر.', "faqJsonAr"='[{"q":"ما الإجراء الواجب اتخاذه في حالة نزيف الأنف؟","a":"أمِل رأسك قليلاً إلى الأمام (لا إلى الخلف)، تمخّط بلطف ثم اضغط بإحكام على المنخرين بين الإبهام والسبابة لمدة 10 إلى 15 دقيقة دون توقف."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='saignement-de-nez' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='السعال', "shortAnswerAr"='السعال هو منعكس يحمي المجاري التنفسية بطرد الإفرازات أو المهيّجات. وهو في أغلب الأحيان مرتبط بعدوى فيروسية حميدة. نميّز بين السعال الجاف والسعال المصحوب ببلغم، وبين السعال الحاد (الحديث) والسعال المزمن (أكثر من 8 أسابيع).', "causesAr"='عدوى فيروسية للمجاري التنفسية (زكام، التهاب القصبات)
تنقيط أنفي خلفي (التهاب الأنف، التهاب الجيوب)
الربو
الارتجاع المعدي المريئي
التدخين أو المهيّجات البيئية', "redFlagsAr"='صعوبة في التنفس أو ضيق نفس أثناء الراحة
بلغم يحتوي على دم
سعال مع حمى مرتفعة مستمرة
ألم صدري شديد
سعال مستمر أكثر من 3 أسابيع دون تحسّن', "whenToConsultAr"='استشِر إذا استمر السعال أكثر من 3 أسابيع، أو صاحبته حمى مستمرة، أو ضيق نفس، أو ألم صدري، أو بلغم دموي.', "faqJsonAr"='[{"q":"ما الفرق بين السعال الجاف والسعال المصحوب ببلغم؟","a":"السعال الجاف لا ينتج إفرازات وغالباً ما يكون مهيّجاً؛ أما السعال المصحوب ببلغم فيرافقه بلغم. قد يختلف علاجهما: اطلب النصيحة من مهني صحي."}]', "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='toux' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='اضطرابات الرؤية', "shortAnswerAr"='قد يكون اضطراب الرؤية تدريجياً (الحاجة إلى نظارات، الساد) أو مفاجئاً. انخفاض الرؤية المفاجئ، سواء كان مؤلماً أو غير مؤلم، هو علامة إنذار تفرض رأياً سريعاً من طبيب العيون.', "causesAr"='اضطراب انكساري (قصر النظر، طول النظر الشيخوخي…)
الساد (الكاتاراكت)
جفاف العين أو التهاب الملتحمة
الشقيقة مع أورة (عابرة)
إصابة الشبكية أو العصب البصري (مستعجل)', "redFlagsAr"='فقدان مفاجئ للرؤية في عين واحدة
ستارة سوداء، حجاب أو ومضات ضوئية
عين حمراء ومؤلمة مع انخفاض الرؤية
ازدواج الرؤية بشكل مفاجئ', "whenToConsultAr"='انخفاض الرؤية المفاجئ أو العين الحمراء والمؤلمة مع انخفاض الرؤية حالات مستعجلة تخص طب العيون. أما للانزعاج التدريجي، فحدّد موعداً.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='troubles-de-la-vue' AND kind='SYMPTOM';
UPDATE health_topics SET "termAr"='الدوار', "shortAnswerAr"='الدوار هو إحساس وهمي بالحركة، غالباً دورانية، للذات أو للمحيط. وهو يعكس في كثير من الأحيان اضطراباً في الأذن الداخلية، لكن قد يكون له أصل عصبي. ويصاحبه أحياناً غثيان واضطرابات في التوازن.', "causesAr"='اضطراب في الأذن الداخلية (الدوار الوضعي، التهاب العصب الدهليزي)
انخفاض ضغط الدم أو نقص السكر
تأثير بعض الأدوية
القلق
سبب عصبي (أكثر ندرة)', "redFlagsAr"='دوار مع اضطرابات في النطق أو الرؤية أو القوة
صداع شديد ومفاجئ مصاحب
فقدان الوعي
دوار بعد إصابة في الرأس
صعوبة في المشي أو الوقوف', "whenToConsultAr"='استشِر إذا كان الدوار شديداً، أو متكرراً، أو معيقاً. إذا صاحبته علامات عصبية، فهو يفرض رأياً على وجه الاستعجال.', "faqJsonAr"=NULL, "arReviewedAt"=now(), "reviewedAt"=COALESCE("reviewedAt", now()) WHERE slug='vertiges' AND kind='SYMPTOM';

COMMIT;
