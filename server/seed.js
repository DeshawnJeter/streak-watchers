const db = require('./db');

// Clear existing data
db.exec(`
  DELETE FROM user_items;
  DELETE FROM shop_items;
  DELETE FROM stories;
  DELETE FROM weekly_xp;
  DELETE FROM user_progress;
  DELETE FROM user_courses;
  DELETE FROM exercises;
  DELETE FROM lessons;
  DELETE FROM skills;
  DELETE FROM courses;
`);

// ─── Courses ────────────────────────────────────────────────────────────────
const insertCourse = db.prepare(`INSERT INTO courses (name, native_name, language_code, flag, learners) VALUES (?, ?, ?, ?, ?)`);
const courses = [
  { name: 'Spanish',    native_name: 'Español',     code: 'es', flag: '🇪🇸', learners: '38.4M' },
  { name: 'French',     native_name: 'Français',    code: 'fr', flag: '🇫🇷', learners: '20.1M' },
  { name: 'Japanese',   native_name: '日本語',       code: 'ja', flag: '🇯🇵', learners: '12.7M' },
  { name: 'German',     native_name: 'Deutsch',     code: 'de', flag: '🇩🇪', learners: '9.8M'  },
  { name: 'Portuguese', native_name: 'Português',   code: 'pt', flag: '🇧🇷', learners: '8.3M'  },
  { name: 'Italian',    native_name: 'Italiano',    code: 'it', flag: '🇮🇹', learners: '6.1M'  },
  { name: 'Korean',     native_name: '한국어',        code: 'ko', flag: '🇰🇷', learners: '5.9M'  },
  { name: 'Mandarin',   native_name: '普通话',        code: 'zh', flag: '🇨🇳', learners: '5.4M'  },
];
const courseIds = {};
for (const c of courses) {
  const r = insertCourse.run(c.name, c.native_name, c.code, c.flag, c.learners);
  courseIds[c.code] = r.lastInsertRowid;
}

// ─── Skills ─────────────────────────────────────────────────────────────────
const insertSkill = db.prepare(`INSERT INTO skills (course_id, name, description, icon, color, order_num, xp_reward) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const insertLesson = db.prepare(`INSERT INTO lessons (skill_id, order_num) VALUES (?, ?)`);
const insertExercise = db.prepare(`INSERT INTO exercises (lesson_id, type, question, options, correct_answer, hint) VALUES (?, ?, ?, ?, ?, ?)`);

function addSkill(courseCode, name, desc, icon, color, order, xp, lessonsData) {
  const skillId = insertSkill.run(courseIds[courseCode], name, desc, icon, color, order, xp).lastInsertRowid;
  for (let i = 0; i < lessonsData.length; i++) {
    const lessonId = insertLesson.run(skillId, i + 1).lastInsertRowid;
    for (const ex of lessonsData[i]) {
      insertExercise.run(lessonId, ex.type, ex.question, ex.options ? JSON.stringify(ex.options) : null, ex.correct, ex.hint || null);
    }
  }
}

// ════════════════════════════════════════════════════════════════════
//  SPANISH
// ════════════════════════════════════════════════════════════════════
addSkill('es', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "hola" mean?', options: ['Hello', 'Goodbye', 'Thank you', 'Please'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "gracias" mean?', options: ['Please', 'Thank you', 'Sorry', 'Hello'], correct: 'Thank you' },
    { type: 'translate', question: 'Translate: "Yo soy un niño"', options: null, correct: 'I am a boy', hint: 'yo=I, soy=am, un=a, niño=boy' },
    { type: 'multiple_choice', question: 'What does "mujer" mean?', options: ['boy', 'girl', 'woman', 'man'], correct: 'woman' },
    { type: 'translate', question: 'Translate: "The girl drinks water"', options: null, correct: 'La niña bebe agua', hint: 'la niña=the girl, bebe=drinks, agua=water' },
    { type: 'fill_blank', question: 'El ___ bebe leche. (The boy drinks milk)', options: ['niño', 'mujer', 'hombre', 'niña'], correct: 'niño' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "buenas noches" mean?', options: ['Good morning', 'Good afternoon', 'Good night', 'Good day'], correct: 'Good night' },
    { type: 'translate', question: 'Translate: "Me llamo María"', options: null, correct: 'My name is María', hint: 'me llamo=my name is' },
    { type: 'multiple_choice', question: 'What does "hombre" mean?', options: ['child', 'woman', 'man', 'boy'], correct: 'man' },
    { type: 'fill_blank', question: '___ me llamo Juan. (My name is Juan)', options: ['Yo', 'Tú', 'Él', 'Ella'], correct: 'Yo', hint: 'Yo=I' },
    { type: 'translate', question: 'Translate: "She is a woman"', options: null, correct: 'Ella es una mujer', hint: 'ella=she, es=is, una=a, mujer=woman' },
    { type: 'multiple_choice', question: 'What does "por favor" mean?', options: ['Thank you', 'Sorry', 'Please', 'Hello'], correct: 'Please' },
  ],
  [
    { type: 'translate', question: 'Translate: "Good morning"', options: null, correct: 'Buenos días', hint: 'buenos=good, días=morning/days' },
    { type: 'multiple_choice', question: 'What does "adiós" mean?', options: ['Hello', 'Goodbye', 'See you', 'Good night'], correct: 'Goodbye' },
    { type: 'fill_blank', question: 'Ella ___ una niña. (She is a girl)', options: ['es', 'son', 'somos', 'soy'], correct: 'es' },
    { type: 'translate', question: 'Translate: "Él es un hombre"', options: null, correct: 'He is a man', hint: 'él=he, es=is, un=a, hombre=man' },
    { type: 'multiple_choice', question: 'What does "de nada" mean?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: "You're welcome" },
    { type: 'translate', question: 'Translate: "Nice to meet you"', options: null, correct: 'Mucho gusto', hint: 'mucho=much/very, gusto=pleasure' },
  ],
]);

addSkill('es', 'Animals', 'Learn animal vocabulary', '🐱', '#ff9600', 2, 120, [
  [
    { type: 'multiple_choice', question: 'What does "el perro" mean?', options: ['cat', 'dog', 'bird', 'fish'], correct: 'dog' },
    { type: 'multiple_choice', question: 'What does "el gato" mean?', options: ['dog', 'bird', 'cat', 'horse'], correct: 'cat' },
    { type: 'translate', question: 'Translate: "The cat eats fish"', options: null, correct: 'El gato come pescado', hint: 'el gato=the cat, come=eats, pescado=fish' },
    { type: 'fill_blank', question: 'El ___ es grande. (The dog is big)', options: ['perro', 'gato', 'pájaro', 'pez'], correct: 'perro' },
    { type: 'multiple_choice', question: 'What does "el pájaro" mean?', options: ['fish', 'bear', 'bird', 'horse'], correct: 'bird' },
    { type: 'translate', question: 'Translate: "The bird is small"', options: null, correct: 'El pájaro es pequeño', hint: 'el pájaro=the bird, pequeño=small' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "el caballo" mean?', options: ['cow', 'pig', 'horse', 'sheep'], correct: 'horse' },
    { type: 'translate', question: 'Translate: "I have a dog"', options: null, correct: 'Yo tengo un perro', hint: 'tengo=I have' },
    { type: 'fill_blank', question: 'La vaca da ___. (The cow gives milk)', options: ['leche', 'agua', 'carne', 'queso'], correct: 'leche' },
    { type: 'multiple_choice', question: 'What does "el oso" mean?', options: ['lion', 'tiger', 'bear', 'wolf'], correct: 'bear' },
    { type: 'translate', question: 'Translate: "The horse is fast"', options: null, correct: 'El caballo es rápido', hint: 'rápido=fast' },
    { type: 'multiple_choice', question: '"El pez" means?', options: ['bird', 'cat', 'dog', 'fish'], correct: 'fish' },
  ],
  [
    { type: 'translate', question: 'Translate: "Two cats and a dog"', options: null, correct: 'Dos gatos y un perro', hint: 'dos=two, y=and' },
    { type: 'multiple_choice', question: 'What does "el elefante" mean?', options: ['giraffe', 'elephant', 'lion', 'zebra'], correct: 'elephant' },
    { type: 'fill_blank', question: 'El ___ tiene una trompa. (The elephant has a trunk)', options: ['elefante', 'oso', 'lobo', 'tigre'], correct: 'elefante' },
    { type: 'translate', question: 'Translate: "The lion is dangerous"', options: null, correct: 'El león es peligroso', hint: 'peligroso=dangerous' },
    { type: 'multiple_choice', question: 'What does "el tigre" mean?', options: ['lion', 'bear', 'wolf', 'tiger'], correct: 'tiger' },
    { type: 'translate', question: 'Translate: "I see a bird"', options: null, correct: 'Yo veo un pájaro', hint: 'veo=I see' },
  ],
]);

addSkill('es', 'Food & Drink', 'Vocabulary for eating and drinking', '🍎', '#1cb0f6', 3, 140, [
  [
    { type: 'multiple_choice', question: 'What does "el pan" mean?', options: ['water', 'milk', 'bread', 'soup'], correct: 'bread' },
    { type: 'translate', question: 'Translate: "I eat bread"', options: null, correct: 'Yo como pan', hint: 'como=I eat, pan=bread' },
    { type: 'multiple_choice', question: 'What does "el agua" mean?', options: ['milk', 'juice', 'wine', 'water'], correct: 'water' },
    { type: 'fill_blank', question: 'Ella bebe ___. (She drinks milk)', options: ['leche', 'pan', 'manzana', 'carne'], correct: 'leche' },
    { type: 'translate', question: 'Translate: "The apple is red"', options: null, correct: 'La manzana es roja', hint: 'manzana=apple, roja=red' },
    { type: 'multiple_choice', question: 'What does "el queso" mean?', options: ['butter', 'milk', 'cheese', 'bread'], correct: 'cheese' },
  ],
  [
    { type: 'translate', question: 'Translate: "I want coffee"', options: null, correct: 'Yo quiero café', hint: 'quiero=I want, café=coffee' },
    { type: 'multiple_choice', question: 'What does "la naranja" mean?', options: ['apple', 'lemon', 'orange', 'grape'], correct: 'orange' },
    { type: 'fill_blank', question: 'El ___ es caliente. (The soup is hot)', options: ['caldo', 'pan', 'queso', 'agua'], correct: 'caldo' },
    { type: 'translate', question: 'Translate: "She eats an egg"', options: null, correct: 'Ella come un huevo', hint: 'huevo=egg' },
    { type: 'multiple_choice', question: 'What does "el arroz" mean?', options: ['bread', 'pasta', 'rice', 'soup'], correct: 'rice' },
    { type: 'translate', question: 'Translate: "We eat dinner at eight"', options: null, correct: 'Cenamos a las ocho', hint: 'cenamos=we have dinner, ocho=eight' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "el restaurante" mean?', options: ['store', 'restaurant', 'kitchen', 'market'], correct: 'restaurant' },
    { type: 'translate', question: 'Translate: "The menu, please"', options: null, correct: 'La carta, por favor', hint: 'carta=menu in Spain' },
    { type: 'fill_blank', question: 'Quiero ___ un café. (I would like a coffee)', options: ['pedir', 'comer', 'beber', 'ver'], correct: 'pedir' },
    { type: 'translate', question: 'Translate: "How much does it cost?"', options: null, correct: '¿Cuánto cuesta?', hint: 'cuánto=how much, cuesta=does it cost' },
    { type: 'multiple_choice', question: '"La cuenta" means?', options: ['the menu', 'the waiter', 'the bill', 'the table'], correct: 'the bill' },
    { type: 'translate', question: 'Translate: "Delicious!"', options: null, correct: '¡Delicioso!', hint: 'Think of "delicious" in English' },
  ],
]);

addSkill('es', 'Travel', 'Navigate travel situations', '✈️', '#ff4b4b', 4, 160, [
  [
    { type: 'multiple_choice', question: 'What does "el aeropuerto" mean?', options: ['bus station', 'train station', 'airport', 'harbor'], correct: 'airport' },
    { type: 'translate', question: 'Translate: "Where is the hotel?"', options: null, correct: '¿Dónde está el hotel?', hint: 'dónde=where, está=is' },
    { type: 'fill_blank', question: 'Necesito un ___. (I need a taxi)', options: ['taxi', 'tren', 'barco', 'autobús'], correct: 'taxi' },
    { type: 'multiple_choice', question: 'What does "el billete" mean?', options: ['passport', 'suitcase', 'ticket', 'visa'], correct: 'ticket' },
    { type: 'translate', question: 'Translate: "I have a reservation"', options: null, correct: 'Tengo una reserva', hint: 'tengo=I have, reserva=reservation' },
    { type: 'multiple_choice', question: '"La maleta" means?', options: ['ticket', 'passport', 'hotel', 'suitcase'], correct: 'suitcase' },
  ],
  [
    { type: 'translate', question: 'Translate: "One ticket to Madrid, please"', options: null, correct: 'Un billete a Madrid, por favor' },
    { type: 'multiple_choice', question: 'What does "el pasaporte" mean?', options: ['visa', 'ticket', 'passport', 'ID card'], correct: 'passport' },
    { type: 'fill_blank', question: '¿Dónde está el ___? (Where is the bathroom?)', options: ['baño', 'hotel', 'banco', 'mercado'], correct: 'baño' },
    { type: 'translate', question: 'Translate: "I am lost"', options: null, correct: 'Estoy perdido', hint: 'estoy=I am, perdido=lost' },
    { type: 'multiple_choice', question: '"El mapa" means?', options: ['guide', 'map', 'sign', 'street'], correct: 'map' },
    { type: 'translate', question: 'Translate: "Help me, please!"', options: null, correct: '¡Ayúdame, por favor!' },
  ],
  [
    { type: 'multiple_choice', question: '"A la derecha" means?', options: ['straight ahead', 'to the left', 'to the right', 'behind'], correct: 'to the right' },
    { type: 'translate', question: 'Translate: "Turn left at the corner"', options: null, correct: 'Gira a la izquierda en la esquina', hint: 'gira=turn, izquierda=left, esquina=corner' },
    { type: 'fill_blank', question: 'El hotel está ___ el banco. (The hotel is next to the bank)', options: ['al lado de', 'debajo de', 'encima de', 'detrás de'], correct: 'al lado de' },
    { type: 'multiple_choice', question: '"¿Cuánto tiempo?" means?', options: ['How much?', 'How far?', 'How long?', 'How many?'], correct: 'How long?' },
    { type: 'translate', question: 'Translate: "The train leaves at three"', options: null, correct: 'El tren sale a las tres', hint: 'sale=leaves, tres=three' },
    { type: 'translate', question: 'Translate: "Enjoy your trip!"', options: null, correct: '¡Buen viaje!', hint: 'buen=good, viaje=trip/journey' },
  ],
]);

addSkill('es', 'Family', 'Talk about your family', '👨‍👩‍👧', '#ce82ff', 5, 180, [
  [
    { type: 'multiple_choice', question: '"La madre" means?', options: ['father', 'sister', 'mother', 'aunt'], correct: 'mother' },
    { type: 'translate', question: 'Translate: "My father is tall"', options: null, correct: 'Mi padre es alto', hint: 'mi=my, padre=father, alto=tall' },
    { type: 'fill_blank', question: 'Mi ___ tiene dos hijos. (My brother has two children)', options: ['hermano', 'hermana', 'primo', 'tío'], correct: 'hermano' },
    { type: 'multiple_choice', question: '"El abuelo" means?', options: ['uncle', 'grandfather', 'father', 'brother'], correct: 'grandfather' },
    { type: 'translate', question: 'Translate: "I have two sisters"', options: null, correct: 'Tengo dos hermanas', hint: 'tengo=I have, hermanas=sisters' },
    { type: 'multiple_choice', question: '"La abuela" means?', options: ['aunt', 'grandmother', 'mother', 'sister'], correct: 'grandmother' },
  ],
  [
    { type: 'translate', question: 'Translate: "Our family is big"', options: null, correct: 'Nuestra familia es grande', hint: 'nuestra=our, grande=big' },
    { type: 'fill_blank', question: 'Mi ___ trabaja en un hospital. (My aunt works in a hospital)', options: ['tía', 'prima', 'abuela', 'hermana'], correct: 'tía' },
    { type: 'multiple_choice', question: '"El hijo" means?', options: ['father', 'brother', 'son', 'nephew'], correct: 'son' },
    { type: 'translate', question: 'Translate: "She is my cousin"', options: null, correct: 'Ella es mi prima', hint: 'prima=female cousin' },
    { type: 'multiple_choice', question: '"Los nietos" means?', options: ['children', 'nephews', 'grandchildren', 'cousins'], correct: 'grandchildren' },
    { type: 'translate', question: 'Translate: "My parents are from Spain"', options: null, correct: 'Mis padres son de España', hint: 'mis=my (plural), padres=parents, son=are' },
  ],
  [
    { type: 'multiple_choice', question: '"El marido" means?', options: ['father', 'brother', 'husband', 'son'], correct: 'husband' },
    { type: 'translate', question: 'Translate: "My wife is a doctor"', options: null, correct: 'Mi esposa es médica', hint: 'esposa=wife, médica=doctor (female)' },
    { type: 'fill_blank', question: 'Mis ___ viven en Madrid. (My grandparents live in Madrid)', options: ['abuelos', 'tíos', 'primos', 'hermanos'], correct: 'abuelos' },
    { type: 'translate', question: 'Translate: "How old is your son?"', options: null, correct: '¿Cuántos años tiene tu hijo?', hint: 'cuántos años=how old, tiene=has/is' },
    { type: 'multiple_choice', question: '"La sobrina" means?', options: ['nephew', 'niece', 'cousin', 'granddaughter'], correct: 'niece' },
    { type: 'translate', question: 'Translate: "We are a happy family"', options: null, correct: 'Somos una familia feliz', hint: 'somos=we are, feliz=happy' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  FRENCH
// ════════════════════════════════════════════════════════════════════
addSkill('fr', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "bonjour" mean?', options: ['Goodbye', 'Good night', 'Hello', 'Thank you'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "merci" mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'translate', question: 'Translate: "Je suis un garçon"', options: null, correct: 'I am a boy', hint: 'je=I, suis=am, garçon=boy' },
    { type: 'multiple_choice', question: 'What does "femme" mean?', options: ['girl', 'boy', 'woman', 'man'], correct: 'woman' },
    { type: 'translate', question: 'Translate: "The girl drinks water"', options: null, correct: 'La fille boit de l\'eau', hint: 'la fille=the girl, boit=drinks, eau=water' },
    { type: 'fill_blank', question: 'Le garçon ___ du lait. (The boy drinks milk)', options: ['boit', 'mange', 'parle', 'dort'], correct: 'boit' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "bonsoir" mean?', options: ['Good morning', 'Good afternoon', 'Good evening', 'Goodbye'], correct: 'Good evening' },
    { type: 'translate', question: 'Translate: "Je m\'appelle Pierre"', options: null, correct: 'My name is Pierre', hint: 'je m\'appelle=my name is' },
    { type: 'multiple_choice', question: 'What does "homme" mean?', options: ['child', 'woman', 'man', 'boy'], correct: 'man' },
    { type: 'fill_blank', question: '___ m\'appelle Marie. (My name is Marie)', options: ['Je', 'Tu', 'Il', 'Elle'], correct: 'Je' },
    { type: 'translate', question: 'Translate: "She is a woman"', options: null, correct: 'Elle est une femme', hint: 'elle=she, est=is, femme=woman' },
    { type: 'multiple_choice', question: 'What does "s\'il vous plaît" mean?', options: ['Thank you', 'Sorry', 'Please', 'Hello'], correct: 'Please' },
  ],
  [
    { type: 'translate', question: 'Translate: "Good morning"', options: null, correct: 'Bonjour', hint: 'bonjour is used for good morning too' },
    { type: 'multiple_choice', question: 'What does "au revoir" mean?', options: ['Hello', 'Goodbye', 'See you', 'Good night'], correct: 'Goodbye' },
    { type: 'fill_blank', question: 'Elle ___ une fille. (She is a girl)', options: ['est', 'sont', 'sommes', 'suis'], correct: 'est' },
    { type: 'translate', question: 'Translate: "Il est un homme"', options: null, correct: 'He is a man', hint: 'il=he, est=is, homme=man' },
    { type: 'multiple_choice', question: '"De rien" means?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: "You're welcome" },
    { type: 'translate', question: 'Translate: "Nice to meet you"', options: null, correct: 'Enchanté', hint: 'enchanté=enchanted/nice to meet you' },
  ],
]);

addSkill('fr', 'Animals', 'Learn animal vocabulary', '🐱', '#ff9600', 2, 120, [
  [
    { type: 'multiple_choice', question: 'What does "le chien" mean?', options: ['cat', 'dog', 'bird', 'fish'], correct: 'dog' },
    { type: 'multiple_choice', question: 'What does "le chat" mean?', options: ['dog', 'bird', 'cat', 'horse'], correct: 'cat' },
    { type: 'translate', question: 'Translate: "The cat eats fish"', options: null, correct: 'Le chat mange du poisson', hint: 'mange=eats, poisson=fish' },
    { type: 'fill_blank', question: 'Le ___ est grand. (The dog is big)', options: ['chien', 'chat', 'oiseau', 'poisson'], correct: 'chien' },
    { type: 'multiple_choice', question: 'What does "l\'oiseau" mean?', options: ['fish', 'bear', 'bird', 'horse'], correct: 'bird' },
    { type: 'translate', question: 'Translate: "The bird is small"', options: null, correct: 'L\'oiseau est petit', hint: 'petit=small' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "le cheval" mean?', options: ['cow', 'pig', 'horse', 'sheep'], correct: 'horse' },
    { type: 'translate', question: 'Translate: "I have a dog"', options: null, correct: 'J\'ai un chien', hint: 'j\'ai=I have' },
    { type: 'fill_blank', question: 'La vache donne du ___. (The cow gives milk)', options: ['lait', 'eau', 'pain', 'fromage'], correct: 'lait' },
    { type: 'multiple_choice', question: 'What does "l\'ours" mean?', options: ['lion', 'tiger', 'bear', 'wolf'], correct: 'bear' },
    { type: 'translate', question: 'Translate: "The horse is fast"', options: null, correct: 'Le cheval est rapide', hint: 'rapide=fast' },
    { type: 'multiple_choice', question: '"Le poisson" means?', options: ['bird', 'cat', 'dog', 'fish'], correct: 'fish' },
  ],
  [
    { type: 'translate', question: 'Translate: "Two cats and a dog"', options: null, correct: 'Deux chats et un chien', hint: 'deux=two, et=and' },
    { type: 'multiple_choice', question: 'What does "l\'éléphant" mean?', options: ['giraffe', 'elephant', 'lion', 'zebra'], correct: 'elephant' },
    { type: 'fill_blank', question: 'L\'___ a une trompe. (The elephant has a trunk)', options: ['éléphant', 'ours', 'loup', 'tigre'], correct: 'éléphant' },
    { type: 'translate', question: 'Translate: "The lion is dangerous"', options: null, correct: 'Le lion est dangereux', hint: 'dangereux=dangerous' },
    { type: 'multiple_choice', question: 'What does "le tigre" mean?', options: ['lion', 'bear', 'wolf', 'tiger'], correct: 'tiger' },
    { type: 'translate', question: 'Translate: "I see a bird"', options: null, correct: 'Je vois un oiseau', hint: 'vois=I see' },
  ],
]);

addSkill('fr', 'Food & Drink', 'Vocabulary for eating and drinking', '🍎', '#1cb0f6', 3, 140, [
  [
    { type: 'multiple_choice', question: 'What does "le pain" mean?', options: ['water', 'milk', 'bread', 'soup'], correct: 'bread' },
    { type: 'translate', question: 'Translate: "I eat bread"', options: null, correct: 'Je mange du pain', hint: 'mange=eat, pain=bread' },
    { type: 'multiple_choice', question: 'What does "l\'eau" mean?', options: ['milk', 'juice', 'wine', 'water'], correct: 'water' },
    { type: 'fill_blank', question: 'Elle boit du ___. (She drinks milk)', options: ['lait', 'pain', 'pomme', 'viande'], correct: 'lait' },
    { type: 'translate', question: 'Translate: "The apple is red"', options: null, correct: 'La pomme est rouge', hint: 'pomme=apple, rouge=red' },
    { type: 'multiple_choice', question: 'What does "le fromage" mean?', options: ['butter', 'milk', 'cheese', 'bread'], correct: 'cheese' },
  ],
  [
    { type: 'translate', question: 'Translate: "I want coffee"', options: null, correct: 'Je veux un café', hint: 'veux=want, café=coffee' },
    { type: 'multiple_choice', question: 'What does "l\'orange" mean?', options: ['apple', 'lemon', 'orange', 'grape'], correct: 'orange' },
    { type: 'fill_blank', question: 'La soupe est ___. (The soup is hot)', options: ['chaude', 'froide', 'grande', 'bonne'], correct: 'chaude' },
    { type: 'translate', question: 'Translate: "She eats an egg"', options: null, correct: 'Elle mange un œuf', hint: 'œuf=egg' },
    { type: 'multiple_choice', question: 'What does "le riz" mean?', options: ['bread', 'pasta', 'rice', 'soup'], correct: 'rice' },
    { type: 'translate', question: 'Translate: "Delicious!"', options: null, correct: 'Délicieux!', hint: 'Think of "delicious" in English' },
  ],
  [
    { type: 'multiple_choice', question: '"Le restaurant" means?', options: ['store', 'restaurant', 'kitchen', 'market'], correct: 'restaurant' },
    { type: 'translate', question: 'Translate: "The menu, please"', options: null, correct: 'La carte, s\'il vous plaît' },
    { type: 'fill_blank', question: 'Je voudrais ___ un café. (I would like to order a coffee)', options: ['commander', 'manger', 'boire', 'voir'], correct: 'commander' },
    { type: 'translate', question: 'Translate: "How much does it cost?"', options: null, correct: 'Combien ça coûte?' },
    { type: 'multiple_choice', question: '"L\'addition" means?', options: ['the menu', 'the waiter', 'the bill', 'the table'], correct: 'the bill' },
    { type: 'translate', question: 'Translate: "A glass of wine, please"', options: null, correct: 'Un verre de vin, s\'il vous plaît', hint: 'verre=glass, vin=wine' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  JAPANESE
// ════════════════════════════════════════════════════════════════════
addSkill('ja', 'Hiragana 1', 'Learn basic hiragana characters', '🈁', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What sound does "あ" make?', options: ['a', 'i', 'u', 'e'], correct: 'a' },
    { type: 'multiple_choice', question: 'What sound does "い" make?', options: ['a', 'i', 'u', 'e'], correct: 'i' },
    { type: 'multiple_choice', question: 'What sound does "う" make?', options: ['a', 'i', 'u', 'e'], correct: 'u' },
    { type: 'multiple_choice', question: 'Which hiragana is "ka"?', options: ['さ', 'か', 'た', 'な'], correct: 'か' },
    { type: 'fill_blank', question: '"Ki" in hiragana is ___', options: ['き', 'く', 'け', 'こ'], correct: 'き' },
    { type: 'multiple_choice', question: 'What does "の" read as?', options: ['na', 'nu', 'ni', 'no'], correct: 'no' },
  ],
  [
    { type: 'multiple_choice', question: 'What sound does "さ" make?', options: ['sa', 'shi', 'su', 'se'], correct: 'sa' },
    { type: 'multiple_choice', question: 'Which hiragana is "mi"?', options: ['ま', 'み', 'む', 'め'], correct: 'み' },
    { type: 'fill_blank', question: '"Ra" in hiragana is ___', options: ['ら', 'り', 'る', 'れ'], correct: 'ら' },
    { type: 'multiple_choice', question: 'What does "は" read as?', options: ['ha', 'hi', 'fu', 'he'], correct: 'ha' },
    { type: 'multiple_choice', question: 'Which hiragana is "yo"?', options: ['や', 'ゆ', 'よ', 'わ'], correct: 'よ' },
    { type: 'fill_blank', question: '"N" (standalone) in hiragana is ___', options: ['ん', 'の', 'な', 'に'], correct: 'ん' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "こんにちは" mean?', options: ['Goodbye', 'Thank you', 'Hello', 'Good morning'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "ありがとう" mean?', options: ['Hello', 'Goodbye', 'Thank you', 'Sorry'], correct: 'Thank you' },
    { type: 'fill_blank', question: '"Ohayou gozaimasu" (good morning) starts with ___', options: ['お', 'あ', 'え', 'い'], correct: 'お' },
    { type: 'multiple_choice', question: 'What does "さようなら" mean?', options: ['Hello', 'Thank you', 'Good night', 'Goodbye'], correct: 'Goodbye' },
    { type: 'translate', question: 'Translate: "My name is..."', options: null, correct: 'わたしの なまえは...', hint: 'watashi no namae wa = my name is' },
    { type: 'multiple_choice', question: 'What does "はい" mean?', options: ['No', 'Maybe', 'Yes', 'OK'], correct: 'Yes' },
  ],
]);

addSkill('ja', 'Basics 1', 'Essential Japanese phrases', '🗾', '#ff9600', 2, 120, [
  [
    { type: 'multiple_choice', question: 'What does "わたし" mean?', options: ['you', 'he', 'I/me', 'we'], correct: 'I/me' },
    { type: 'multiple_choice', question: 'What does "ねこ" mean?', options: ['dog', 'bird', 'fish', 'cat'], correct: 'cat' },
    { type: 'multiple_choice', question: 'What does "いぬ" mean?', options: ['cat', 'dog', 'horse', 'bird'], correct: 'dog' },
    { type: 'fill_blank', question: 'わたしは ___ です。 (I am a student)', options: ['がくせい', 'せんせい', 'いしゃ', 'かいしゃいん'], correct: 'がくせい' },
    { type: 'translate', question: 'Translate: "This is a cat"', options: null, correct: 'これは ねこです', hint: 'kore wa = this is, neko = cat, desu = is' },
    { type: 'multiple_choice', question: 'What does "おはよう" mean?', options: ['Good evening', 'Good night', 'Good morning', 'Hello'], correct: 'Good morning' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "たべます" mean?', options: ['drink', 'sleep', 'eat', 'walk'], correct: 'eat' },
    { type: 'translate', question: 'Translate: "I drink water"', options: null, correct: 'わたしは みずを のみます', hint: 'mizu=water, nomimasu=drink' },
    { type: 'fill_blank', question: 'すみません、___ ですか？ (Excuse me, how much is it?)', options: ['いくら', 'なに', 'どこ', 'だれ'], correct: 'いくら' },
    { type: 'multiple_choice', question: '"おいしい" means?', options: ['hot', 'cold', 'delicious', 'big'], correct: 'delicious' },
    { type: 'translate', question: 'Translate: "Where is the station?"', options: null, correct: 'えきは どこですか？', hint: 'eki=station, doko=where' },
    { type: 'multiple_choice', question: 'What does "だいじょうぶ" mean?', options: ['dangerous', "I'm fine/it's OK", 'I don\'t know', 'Please'], correct: "I'm fine/it's OK" },
  ],
  [
    { type: 'translate', question: 'Translate: "I like sushi"', options: null, correct: 'わたしは すしが すきです', hint: 'suki=like, sushi=sushi' },
    { type: 'multiple_choice', question: '"えいご" means?', options: ['Japanese', 'French', 'English', 'Chinese'], correct: 'English' },
    { type: 'fill_blank', question: 'にほんごが ___ です。 (I can speak Japanese)', options: ['はなせます', 'たべます', 'のみます', 'みます'], correct: 'はなせます' },
    { type: 'translate', question: 'Translate: "Good night"', options: null, correct: 'おやすみなさい', hint: 'oyasuminasai' },
    { type: 'multiple_choice', question: 'What does "ありがとうございます" mean?', options: ['I\'m sorry', 'Excuse me', 'Thank you very much', 'You\'re welcome'], correct: 'Thank you very much' },
    { type: 'translate', question: 'Translate: "See you tomorrow"', options: null, correct: 'またあした', hint: 'mata=again/see you, ashita=tomorrow' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  GERMAN
// ════════════════════════════════════════════════════════════════════
addSkill('de', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "Hallo" mean?', options: ['Goodbye', 'Good night', 'Hello', 'Thank you'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "Danke" mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'translate', question: 'Translate: "Ich bin ein Junge"', options: null, correct: 'I am a boy', hint: 'ich=I, bin=am, Junge=boy' },
    { type: 'multiple_choice', question: 'What does "Frau" mean?', options: ['girl', 'boy', 'woman', 'man'], correct: 'woman' },
    { type: 'translate', question: 'Translate: "The girl drinks water"', options: null, correct: 'Das Mädchen trinkt Wasser', hint: 'Mädchen=girl, trinkt=drinks, Wasser=water' },
    { type: 'fill_blank', question: 'Der Junge trinkt ___. (The boy drinks milk)', options: ['Milch', 'Wasser', 'Saft', 'Kaffee'], correct: 'Milch' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "Guten Morgen" mean?', options: ['Good evening', 'Good night', 'Good morning', 'Goodbye'], correct: 'Good morning' },
    { type: 'translate', question: 'Translate: "Ich heiße Klaus"', options: null, correct: 'My name is Klaus', hint: 'ich heiße=my name is' },
    { type: 'multiple_choice', question: 'What does "Mann" mean?', options: ['child', 'woman', 'man', 'boy'], correct: 'man' },
    { type: 'fill_blank', question: 'Ich ___ Klaus. (My name is Klaus)', options: ['heiße', 'bin', 'habe', 'gehe'], correct: 'heiße' },
    { type: 'translate', question: 'Translate: "She is a woman"', options: null, correct: 'Sie ist eine Frau', hint: 'sie=she, ist=is, Frau=woman' },
    { type: 'multiple_choice', question: 'What does "Bitte" mean?', options: ['Thank you', 'Sorry', 'Please', 'Hello'], correct: 'Please' },
  ],
  [
    { type: 'translate', question: 'Translate: "Good evening"', options: null, correct: 'Guten Abend', hint: 'Abend=evening' },
    { type: 'multiple_choice', question: 'What does "Auf Wiedersehen" mean?', options: ['Hello', 'Goodbye', 'See you', 'Good night'], correct: 'Goodbye' },
    { type: 'fill_blank', question: 'Sie ___ eine Frau. (She is a woman)', options: ['ist', 'sind', 'bin', 'bist'], correct: 'ist' },
    { type: 'translate', question: 'Translate: "Er ist ein Mann"', options: null, correct: 'He is a man', hint: 'er=he, Mann=man' },
    { type: 'multiple_choice', question: '"Bitte schön" means?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: "You're welcome" },
    { type: 'translate', question: 'Translate: "Nice to meet you"', options: null, correct: 'Schön, Sie kennenzulernen', hint: 'schön=nice, kennenlernen=to meet' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  PORTUGUESE
// ════════════════════════════════════════════════════════════════════
addSkill('pt', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "olá" mean?', options: ['Goodbye', 'Good night', 'Hello', 'Thank you'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "obrigado" mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'translate', question: 'Translate: "Eu sou um menino"', options: null, correct: 'I am a boy', hint: 'eu=I, sou=am, menino=boy' },
    { type: 'multiple_choice', question: 'What does "mulher" mean?', options: ['girl', 'boy', 'woman', 'man'], correct: 'woman' },
    { type: 'translate', question: 'Translate: "The girl drinks water"', options: null, correct: 'A menina bebe água', hint: 'menina=girl, bebe=drinks, água=water' },
    { type: 'fill_blank', question: 'O menino bebe ___. (The boy drinks milk)', options: ['leite', 'água', 'suco', 'café'], correct: 'leite' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "bom dia" mean?', options: ['Good evening', 'Good night', 'Good morning', 'Goodbye'], correct: 'Good morning' },
    { type: 'translate', question: 'Translate: "Meu nome é João"', options: null, correct: 'My name is João', hint: 'meu nome=my name, é=is' },
    { type: 'multiple_choice', question: 'What does "homem" mean?', options: ['child', 'woman', 'man', 'boy'], correct: 'man' },
    { type: 'fill_blank', question: 'Eu ___ João. (My name is João)', options: ['me chamo', 'sou', 'tenho', 'vou'], correct: 'me chamo' },
    { type: 'translate', question: 'Translate: "She is a woman"', options: null, correct: 'Ela é uma mulher', hint: 'ela=she, é=is, mulher=woman' },
    { type: 'multiple_choice', question: 'What does "por favor" mean?', options: ['Thank you', 'Sorry', 'Please', 'Hello'], correct: 'Please' },
  ],
  [
    { type: 'translate', question: 'Translate: "Good evening"', options: null, correct: 'Boa tarde', hint: 'boa=good (fem), tarde=afternoon/evening' },
    { type: 'multiple_choice', question: 'What does "tchau" mean?', options: ['Hello', 'Goodbye', 'See you', 'Good night'], correct: 'Goodbye' },
    { type: 'fill_blank', question: 'Ela ___ uma menina. (She is a girl)', options: ['é', 'são', 'somos', 'sou'], correct: 'é' },
    { type: 'translate', question: 'Translate: "Ele é um homem"', options: null, correct: 'He is a man', hint: 'ele=he, homem=man' },
    { type: 'multiple_choice', question: '"De nada" means?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: "You're welcome" },
    { type: 'translate', question: 'Translate: "Nice to meet you"', options: null, correct: 'Prazer em te conhecer', hint: 'prazer=pleasure, conhecer=to know/meet' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  ITALIAN
// ════════════════════════════════════════════════════════════════════
addSkill('it', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "ciao" mean?', options: ['Goodbye only', 'Good night', 'Hi / Bye', 'Thank you'], correct: 'Hi / Bye' },
    { type: 'multiple_choice', question: 'What does "grazie" mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'translate', question: 'Translate: "Io sono un ragazzo"', options: null, correct: 'I am a boy', hint: 'io=I, sono=am, ragazzo=boy' },
    { type: 'multiple_choice', question: 'What does "donna" mean?', options: ['girl', 'boy', 'woman', 'man'], correct: 'woman' },
    { type: 'translate', question: 'Translate: "The girl drinks water"', options: null, correct: 'La ragazza beve acqua', hint: 'ragazza=girl, beve=drinks, acqua=water' },
    { type: 'fill_blank', question: 'Il ragazzo beve ___. (The boy drinks milk)', options: ['latte', 'acqua', 'succo', 'caffè'], correct: 'latte' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "buongiorno" mean?', options: ['Good evening', 'Good night', 'Good morning', 'Goodbye'], correct: 'Good morning' },
    { type: 'translate', question: 'Translate: "Mi chiamo Marco"', options: null, correct: 'My name is Marco', hint: 'mi chiamo=my name is' },
    { type: 'multiple_choice', question: 'What does "uomo" mean?', options: ['child', 'woman', 'man', 'boy'], correct: 'man' },
    { type: 'fill_blank', question: 'Mi ___ Giulia. (My name is Giulia)', options: ['chiamo', 'sono', 'ho', 'vado'], correct: 'chiamo' },
    { type: 'translate', question: 'Translate: "She is a woman"', options: null, correct: 'Lei è una donna', hint: 'lei=she, è=is, donna=woman' },
    { type: 'multiple_choice', question: 'What does "prego" mean?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: "You're welcome" },
  ],
  [
    { type: 'translate', question: 'Translate: "Good evening"', options: null, correct: 'Buonasera', hint: 'buona=good (fem), sera=evening' },
    { type: 'multiple_choice', question: 'What does "arrivederci" mean?', options: ['Hello', 'Goodbye', 'See you later', 'Good night'], correct: 'Goodbye' },
    { type: 'fill_blank', question: 'Lei ___ una ragazza. (She is a girl)', options: ['è', 'sono', 'siamo', 'sei'], correct: 'è' },
    { type: 'translate', question: 'Translate: "Lui è un uomo"', options: null, correct: 'He is a man', hint: 'lui=he, uomo=man' },
    { type: 'multiple_choice', question: '"Per favore" means?', options: ['Thank you', 'Sorry', "You're welcome", 'Please'], correct: 'Please' },
    { type: 'translate', question: 'Translate: "Nice to meet you"', options: null, correct: 'Piacere di conoscerti', hint: 'piacere=pleasure, conoscerti=to meet you' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  KOREAN
// ════════════════════════════════════════════════════════════════════
addSkill('ko', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "안녕하세요" mean?', options: ['Goodbye', 'Good night', 'Hello', 'Thank you'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "감사합니다" mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'multiple_choice', question: 'What does "네" mean?', options: ['No', 'Maybe', 'Yes', 'OK'], correct: 'Yes' },
    { type: 'multiple_choice', question: 'What does "아니요" mean?', options: ['Yes', 'Maybe', 'No', 'OK'], correct: 'No' },
    { type: 'translate', question: 'Translate: "My name is..."', options: null, correct: '저는 ...이에요', hint: 'jeoneun=I, ieyo=am/is' },
    { type: 'multiple_choice', question: 'What does "안녕히 가세요" mean?', options: ['Hello', 'Goodbye (said to one leaving)', 'Good night', 'See you'], correct: 'Goodbye (said to one leaving)' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "물" mean?', options: ['milk', 'juice', 'wine', 'water'], correct: 'water' },
    { type: 'multiple_choice', question: 'What does "밥" mean?', options: ['bread', 'pasta', 'rice/meal', 'soup'], correct: 'rice/meal' },
    { type: 'translate', question: 'Translate: "I eat rice"', options: null, correct: '저는 밥을 먹어요', hint: 'bap=rice, meogoyo=eat' },
    { type: 'multiple_choice', question: 'What does "고양이" mean?', options: ['dog', 'bird', 'cat', 'fish'], correct: 'cat' },
    { type: 'multiple_choice', question: 'What does "강아지" mean?', options: ['cat', 'dog', 'horse', 'bird'], correct: 'dog' },
    { type: 'translate', question: 'Translate: "I like Korean food"', options: null, correct: '저는 한국 음식을 좋아해요', hint: 'joahaeyo=like, eumsik=food' },
  ],
  [
    { type: 'multiple_choice', question: '"어디" means?', options: ['when', 'what', 'where', 'who'], correct: 'where' },
    { type: 'translate', question: 'Translate: "Where is the bathroom?"', options: null, correct: '화장실이 어디에요?', hint: 'hwajangsil=bathroom, eodi=where' },
    { type: 'multiple_choice', question: 'What does "맛있어요" mean?', options: ['hot', 'cold', 'delicious', 'big'], correct: 'delicious' },
    { type: 'translate', question: 'Translate: "Thank you very much"', options: null, correct: '정말 감사합니다', hint: 'jeongmal=really/very much' },
    { type: 'multiple_choice', question: 'What does "죄송합니다" mean?', options: ['Thank you', 'Excuse me', 'I\'m sorry', 'Please'], correct: "I'm sorry" },
    { type: 'translate', question: 'Translate: "See you tomorrow"', options: null, correct: '내일 봐요', hint: 'naeil=tomorrow, bwayo=see' },
  ],
]);

// ════════════════════════════════════════════════════════════════════
//  MANDARIN
// ════════════════════════════════════════════════════════════════════
addSkill('zh', 'Basics 1', 'Greetings and introductions', '👋', '#58cc02', 1, 100, [
  [
    { type: 'multiple_choice', question: 'What does "你好" (nǐ hǎo) mean?', options: ['Goodbye', 'Good night', 'Hello', 'Thank you'], correct: 'Hello' },
    { type: 'multiple_choice', question: 'What does "谢谢" (xiè xie) mean?', options: ['Please', 'Sorry', 'Thank you', 'Hello'], correct: 'Thank you' },
    { type: 'multiple_choice', question: 'What does "是" (shì) mean?', options: ['No', 'Maybe', 'Yes/to be', 'OK'], correct: 'Yes/to be' },
    { type: 'multiple_choice', question: 'What does "再见" (zài jiàn) mean?', options: ['Hello', 'Thank you', 'Goodbye', 'Please'], correct: 'Goodbye' },
    { type: 'translate', question: 'Translate: "My name is..."', options: null, correct: '我叫...', hint: 'wǒ jiào = I am called...' },
    { type: 'multiple_choice', question: '"早上好" (zǎo shàng hǎo) means?', options: ['Good evening', 'Good night', 'Good morning', 'Good afternoon'], correct: 'Good morning' },
  ],
  [
    { type: 'multiple_choice', question: 'What does "水" (shuǐ) mean?', options: ['milk', 'juice', 'wine', 'water'], correct: 'water' },
    { type: 'multiple_choice', question: 'What does "米饭" (mǐ fàn) mean?', options: ['bread', 'pasta', 'rice', 'soup'], correct: 'rice' },
    { type: 'translate', question: 'Translate: "I eat rice"', options: null, correct: '我吃米饭', hint: 'wǒ=I, chī=eat, mǐ fàn=rice' },
    { type: 'multiple_choice', question: 'What does "猫" (māo) mean?', options: ['dog', 'bird', 'cat', 'fish'], correct: 'cat' },
    { type: 'multiple_choice', question: 'What does "狗" (gǒu) mean?', options: ['cat', 'dog', 'horse', 'bird'], correct: 'dog' },
    { type: 'translate', question: 'Translate: "I like Chinese food"', options: null, correct: '我喜欢中国食物', hint: 'xǐhuān=like, Zhōngguó=China, shíwù=food' },
  ],
  [
    { type: 'multiple_choice', question: '"哪里" (nǎ lǐ) means?', options: ['when', 'what', 'where', 'who'], correct: 'where' },
    { type: 'translate', question: 'Translate: "Where is the bathroom?"', options: null, correct: '洗手间在哪里？', hint: 'xǐshǒujiān=bathroom, zài=at, nǎlǐ=where' },
    { type: 'multiple_choice', question: 'What does "好吃" (hǎo chī) mean?', options: ['hot', 'cold', 'delicious', 'big'], correct: 'delicious' },
    { type: 'translate', question: 'Translate: "Thank you very much"', options: null, correct: '非常感谢', hint: 'fēicháng=very much, gǎnxiè=thank you' },
    { type: 'multiple_choice', question: 'What does "对不起" (duì bù qǐ) mean?', options: ['Thank you', 'Excuse me', 'I\'m sorry', 'Please'], correct: "I'm sorry" },
    { type: 'translate', question: 'Translate: "See you tomorrow"', options: null, correct: '明天见', hint: 'míngtiān=tomorrow, jiàn=see' },
  ],
]);

// ─── Stories ─────────────────────────────────────────────────────────────────
const insertStory = db.prepare(`INSERT INTO stories (course_id, title, description, difficulty, cover_emoji, duration_minutes, xp_reward) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const storyData = [
  [courseIds['es'], 'A Trip to the Market', 'María goes shopping at the local market and learns how to bargain.', 'beginner', '🛒', 4, 20],
  [courseIds['es'], 'A Day at the Beach', 'Carlos spends a day at the beach and meets new friends.', 'beginner', '🏖️', 5, 20],
  [courseIds['es'], 'The Lost Tourist', 'Help a tourist find their way through the city streets.', 'intermediate', '🗺️', 6, 30],
  [courseIds['es'], 'My New Apartment', 'Ana moves into her new apartment and describes it.', 'intermediate', '🏠', 7, 30],
  [courseIds['es'], 'El Cumpleaños', 'A surprise birthday party with family and friends.', 'intermediate', '🎂', 5, 30],
  [courseIds['es'], 'The Job Interview', 'Practice professional vocabulary with a job interview scenario.', 'advanced', '💼', 8, 40],
  [courseIds['fr'], 'Au Café', 'Order coffee and pastries at a Parisian café.', 'beginner', '☕', 4, 20],
  [courseIds['fr'], 'La Boulangerie', 'Visit a French bakery and learn bread vocabulary.', 'beginner', '🥐', 5, 20],
  [courseIds['fr'], 'Le Weekend', 'Pierre describes his weekend plans to a friend.', 'intermediate', '🎿', 6, 30],
  [courseIds['fr'], 'À la Gare', 'Buying train tickets and navigating the train station.', 'intermediate', '🚂', 7, 30],
  [courseIds['ja'], 'はじめまして', 'First meeting — introductions at a Japanese school.', 'beginner', '🏫', 4, 20],
  [courseIds['ja'], 'レストランで', 'Ordering food at a Japanese restaurant.', 'beginner', '🍣', 5, 20],
  [courseIds['de'], 'Am Bahnhof', 'Finding your way around a German train station.', 'beginner', '🚄', 4, 20],
  [courseIds['de'], 'Im Supermarkt', 'Shopping for groceries at a German supermarket.', 'beginner', '🛒', 5, 20],
];

for (const s of storyData) insertStory.run(...s);

// ─── Shop items ──────────────────────────────────────────────────────────────
const insertItem = db.prepare(`INSERT INTO shop_items (name, description, type, cost_gems, icon, category) VALUES (?, ?, ?, ?, ?, ?)`);

const shopItems = [
  ['Heart Refill', 'Refill all your hearts instantly', 'hearts', 350, '❤️', 'power-ups'],
  ['Streak Freeze', 'Protect your streak for one day', 'streak_freeze', 200, '🧊', 'power-ups'],
  ['Double XP (1 hour)', 'Earn double XP for 60 minutes', 'xp_boost', 100, '⚡', 'power-ups'],
  ['Legendary Outfit', 'A legendary golden owl outfit', 'outfit', 1500, '🦉', 'outfits'],
  ['Super Outfit', 'A sleek super Duolingo outfit', 'outfit', 1000, '🦸', 'outfits'],
  ['Knight Outfit', 'A knight\'s armor outfit', 'outfit', 800, '🏰', 'outfits'],
  ['Pirate Outfit', 'Set sail with a pirate outfit', 'outfit', 800, '🏴‍☠️', 'outfits'],
  ['Hearts Pack ×3', 'Gain 3 extra heart refills', 'hearts', 900, '💗', 'power-ups'],
  ['Weekend Amulet', 'Earns XP even when offline on weekends', 'amulet', 400, '💎', 'power-ups'],
  ['Timed Challenge', 'Unlock special timed challenges', 'challenge', 150, '⏱️', 'power-ups'],
];

for (const i of shopItems) insertItem.run(...i);

console.log('✅ Database seeded successfully!');
console.log(`   ${courses.length} courses`);
console.log(`   ${storyData.length} stories`);
console.log(`   ${shopItems.length} shop items`);
