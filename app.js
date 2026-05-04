// 1. COMPTE À REBOURS
function updateCountdown() {
    const dateEntree = new Date("January 7, 2027 00:00:00").getTime();
    const maintenant = new Date().getTime();
    const distance = dateEntree - maintenant;

    const jours = Math.floor(distance / (1000 * 60 * 60 * 24));
    const heures = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (distance < 0) {
        document.getElementById("timer").innerHTML = "C'est le grand jour ! 🇨🇦";
    } else {
        document.getElementById("timer").innerHTML = `J - ${jours} jours et ${heures}h`;
    }
}

// 2. CONVERTISSEUR FCFA -> CAD (Taux approx : 1 CAD = 445 FCFA)
function convertirVersCAD() {
    const fcfa = document.getElementById('fcfa-input').value;
    const cad = (fcfa / 445).toFixed(2);
    document.getElementById('cad-result').innerText = cad + " $ CAD";
}

// Liste des tarifs en FCFA correspondant à l'ordre de tes lignes
const tarifsFCFA = [57600, 67500, 38250, 405000, 36000, 135000];

function updateProgress() {
    const checksProg = document.querySelectorAll('.todo-list input[type="checkbox"]');
    const checksFrais = document.querySelectorAll('.todo-list-frais input[type="checkbox"]');

    let totalPaye = 0;
    let checkedCountProg = 0;
    let checkedCountFrais = 0;

    checksProg.forEach((check) => {
        if (check.checked) {
            checkedCountProg++;
        }
    });

    checksFrais.forEach((check, index) => {
        if (check.checked) {
            checkedCountFrais++;
            totalPaye += tarifsFCFA[index] || 0;
        }
    });

    const percentProg = checksProg.length ? Math.round((checkedCountProg / checksProg.length) * 100) : 0;
    const percentFrais = checksFrais.length ? Math.round((checkedCountFrais / checksFrais.length) * 100) : 0;

    const barProg = document.getElementById('progress-bar');
    if (barProg) {
        barProg.style.width = percentProg + "%";
        barProg.innerText = percentProg + "%";
    }

    const barFrais = document.getElementById('progress-bar-frais');
    if (barFrais) {
        barFrais.style.width = percentFrais + "%";
        barFrais.innerText = percentFrais + "%";
    }

    const totalEl = document.getElementById('total-paye');
    if (totalEl) {
        totalEl.innerText = totalPaye.toLocaleString() + " FCFA";
    }

    const states = {
        progression: Array.from(checksProg).map(c => c.checked),
        frais: Array.from(checksFrais).map(c => c.checked)
    };
    localStorage.setItem('voyageStates', JSON.stringify(states));
}

function sauvegarderPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Cette fonction enlève les espaces bizarres qui font bugger le PDF
    const nettoyer = (t) => t.replace(/\s/g, " ").replace(/[^\x00-\x7F]/g, "").trim();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("BILAN QUALITECH 2027", 20, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    const total = document.getElementById('total-paye').innerText;
    doc.text(`Total investi : ${nettoyer(total)}`, 20, 40);
    doc.text("--------------------------------------------------", 20, 50);

    // On parcourt les deux listes de tâches
    const listes = document.querySelectorAll('.todo-list li, .todo-list-frais li');
    let y = 65;

    listes.forEach((item) => {
        const estCoche = item.querySelector('input').checked ? "[X]" : "[ ]";
        // On récupère le texte, on nettoie les symboles bizarres
        const texteBrut = item.innerText;
        const textePropre = nettoyer(texteBrut);
        
        doc.text(`${estCoche} ${textePropre}`, 20, y);
        y += 10;

        if (y > 275) { doc.addPage(); y = 20; }
    });

    doc.save("Ma_Preparation_Qualitech.pdf");
}


// Initialisation
window.onload = () => {
    updateCountdown();
    setInterval(updateCountdown, 60000); // Mise à jour chaque minute

    const saved = JSON.parse(localStorage.getItem('voyageStates'));
    if (saved) {
        const checksProg = document.querySelectorAll('.todo-list input[type="checkbox"]');
        const checksFrais = document.querySelectorAll('.todo-list-frais input[type="checkbox"]');
        if (saved.progression) {
            saved.progression.forEach((state, i) => { if (checksProg[i]) checksProg[i].checked = state; });
        }
        if (saved.frais) {
            saved.frais.forEach((state, i) => { if (checksFrais[i]) checksFrais[i].checked = state; });
        }
        updateProgress();
    }
};
