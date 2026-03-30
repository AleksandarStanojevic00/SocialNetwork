let session = new Session();
session=session.getSession();

if(session !== "") {
    window.location.href = 'hexa.html';
}

const modal = document.querySelector('.custom-modal');
const openBtn = document.querySelector('#registracija');
const closeBtn = document.querySelector('#closeModal');

// Otvaranje modala
openBtn.addEventListener('click', (e) => {
    e.preventDefault(); // Sprečava reload stranice ako je dugme unutar forme
    modal.classList.add('active');
});

// Zatvaranje modala
closeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.remove('active');
});

// Zatvaranje klikom van forme
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

//Validacija forme
let config = {
    'korisnicko_ime': {
        required: true,
        minlength: 5,
        maxlength: 50
    },

    'register_email': {
        required: true,
        email: true,
        minlength: 5,
        maxlength: 50
    },

    'register_lozinka': {
        required: true,
        minlength: 7,
        maxlength: 25,
        matching: 'ponovi_lozinku'
    },

    'ponovi_lozinku': {
        required: true,
        minlength: 7,
        maxlength: 25,
        matching: 'register_lozinka'
    }
};

let validator = new Validator(config, '#registrationForm');

// Submition forme
document.querySelector('#registrationForm').addEventListener('submit', e => {
    e.preventDefault();

    if (validator.validationPassed()) {
        let user = new User();
        user.username = document.querySelector('#korisnicko_ime').value;
        user.email = document.querySelector('input[name="register_email"]').value;
        user.password = document.querySelector('input[name="register_lozinka"]').value;

        user.create();

        
    } else {
        alert('Not OK');
    }
});

const loginForm = document.querySelector('#loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();

        const emailInput = e.currentTarget.querySelector('#login_email');
        const passwordInput = e.currentTarget.querySelector('#login_lozinka');

        if (!emailInput || !passwordInput) {
            console.error('Login inputs are missing in the DOM.');
            return;
        }

        let user = new User();
        user.email = emailInput.value;
        user.password = passwordInput.value;
        user.login();
    });
}
