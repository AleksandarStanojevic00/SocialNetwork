class User {
    user_id = '';
    username = '';
    email = '';
    password = ''
    api_url = 'https://69c6b197f272266f3eacfe99.mockapi.io';

    create(){
        let data = {
            username: this.username,
            email: this.email,
            password: this.password
        };

        data = JSON.stringify(data);

        fetch(this.api_url + '/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        })
        .then(response => response.json())
        .then(data => {
            let session = new Session();
            session.user_id = data.id;
            session.startSession();

            window.location.href = 'hexa.html';

        })
        .catch(error => {
            console.error('Error creating user:', error);
        });     
    }

    login() {
    fetch(this.api_url + '/users')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch users. Status: ${response.status}`);
            }
            return response.json();
        })
        .then(users => {
            const matchedUser = users.find(user => {
                return user.email === this.email && user.password === this.password;
            });

            if (!matchedUser) {
                alert('Wrong email or password.');
                return;
            }

            let session = new Session();
            session.user_id = matchedUser.id;
            session.startSession();

            window.location.href = 'hexa.html';
        })
        .catch(error => {
            console.error('Error during login:', error);
            alert('An error occurred during login. Please try again later.');
        });
    }
}    
