


const STORAGE_KEY = "student_cards_v1";

function uid() {
return 's_' + Math.random().toString(36).slice(2,10);
}

function loadStudents(){
try{
const raw = localStorage.getItem(STORAGE_KEY);
return raw ? JSON.parse(raw) : [];
}catch(e){
console.error("Failed to parse students:", e);
return [];
}
}

function saveStudents(list){
localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderStudents(filterText = "") {
const grid = document.getElementById('cardsGrid');
const empty = document.getElementById('emptyState');
const count = document.getElementById('count');
grid.innerHTML = "";
let students = loadStudents();

if (filterText) {
const q = filterText.toLowerCase();
students = students.filter(s =>
    (s.name || "").toLowerCase().includes(q) ||
    (s.roll || "").toLowerCase().includes(q) ||
    (s.className || "").toLowerCase().includes(q) ||
    (s.email || "").toLowerCase().includes(q)
);
}

count.textContent = students.length;

if (students.length === 0) {
empty.style.display = "block";
return;
} else {
empty.style.display = "none";
}

students.forEach(s => {
const card = document.createElement('article');
card.className = "card";

const avatar = document.createElement('div');
avatar.className = "avatar";
if (s.photo) {
    const img = document.createElement('img');
    img.src = s.photo;
    img.alt = s.name || 'avatar';
    img.onerror = function(){ this.style.display = 'none'; avatar.textContent = initials(s.name) }
    avatar.appendChild(img);
} else {
    avatar.textContent = initials(s.name);
}

const meta = document.createElement('div');
meta.className = "meta";
const h3 = document.createElement('h3');
h3.textContent = s.name || "Unnamed";
meta.appendChild(h3);

const p = document.createElement('p');
let parts = [];
if (s.roll) parts.push("Roll: " + s.roll);
if (s.className) parts.push(s.className);
if (s.age) parts.push("Age: " + s.age);
p.textContent = parts.join(" • ");
meta.appendChild(p);

const chips = document.createElement('div');
chips.className = "chips";
if (s.email) {
    const c = document.createElement('span'); c.className='chip'; c.textContent = s.email; chips.appendChild(c);
}
if (s.notes) {
    const c = document.createElement('span'); c.className='chip'; c.textContent = s.notes.length > 26 ? s.notes.slice(0,26) + '…' : s.notes; chips.appendChild(c);
}
meta.appendChild(chips);

const controls = document.createElement('div');
controls.className = "controls";
const editBtn = document.createElement('button');
editBtn.className = "icon-btn";
editBtn.innerHTML = "✏️";
editBtn.title = "Edit";
editBtn.onclick = () => fillFormForEdit(s.id);

const delBtn = document.createElement('button');
delBtn.className = "icon-btn";
delBtn.innerHTML = "🗑️";
delBtn.title = "Delete";
delBtn.onclick = () => {
    if (confirm(`Delete \"${s.name || 'student'}\"?`)) {
    deleteStudent(s.id);
    }
};

controls.appendChild(editBtn);
controls.appendChild(delBtn);

card.appendChild(avatar);
card.appendChild(meta);
card.appendChild(controls);

grid.appendChild(card);
});
}

function initials(name){
if (!name) return "—";
const parts = name.trim().split(/\s+/);
if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function addStudent(data){
const list = loadStudents();
list.unshift({...data, id: uid(), created: Date.now()});
saveStudents(list);
renderStudents(document.getElementById('search').value);
clearForm();
}

function updateStudent(id, data){
const list = loadStudents();
const idx = list.findIndex(s=>s.id === id);
if (idx === -1) return;
list[idx] = {...list[idx], ...data, updated: Date.now()};
saveStudents(list);
renderStudents(document.getElementById('search').value);
clearForm();
}

function deleteStudent(id){
let list = loadStudents();
list = list.filter(s=>s.id !== id);
saveStudents(list);
renderStudents(document.getElementById('search').value);
}

function fillFormForEdit(id){
const list = loadStudents();
const s = list.find(x=>x.id === id);
if (!s) return;
document.getElementById('studentId').value = s.id;
document.getElementById('name').value = s.name || "";
document.getElementById('age').value = s.age || "";
document.getElementById('className').value = s.className || "";
document.getElementById('roll').value = s.roll || "";
document.getElementById('email').value = s.email || "";
document.getElementById('photo').value = s.photo || "";
document.getElementById('notes').value = s.notes || "";
document.getElementById('name').focus();
document.getElementById('saveBtn').textContent = "Update student";
}

function clearForm(){
document.getElementById('studentId').value = "";
document.getElementById('studentForm').reset();
document.getElementById('saveBtn').textContent = "Save student";
}

function clearAll(){
if (!confirm("Delete ALL students from this browser? This cannot be undone.")) return;
localStorage.removeItem(STORAGE_KEY);
renderStudents();
}

document.getElementById('saveBtn').addEventListener('click', () => {
const id = document.getElementById('studentId').value || null;
const payload = {
name: document.getElementById('name').value.trim(),
age: document.getElementById('age').value.trim(),
className: document.getElementById('className').value.trim(),
roll: document.getElementById('roll').value.trim(),
email: document.getElementById('email').value.trim(),
photo: document.getElementById('photo').value.trim(),
notes: document.getElementById('notes').value.trim()
};

if (!payload.name) {
alert("Please enter the student's name.");
return;
}

if (id) updateStudent(id, payload);
else addStudent(payload);
});

document.getElementById('clearFormBtn').addEventListener('click', clearForm);
document.getElementById('clearAllBtn').addEventListener('click', clearAll);

document.getElementById('search').addEventListener('input', (e) => {
renderStudents(e.target.value);
});

// initialize
renderStudents();

