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
    async get(user_id) {
        let api_url = this.api_url + '/users/' + user_id;
        let response = await fetch(api_url);
        let data = await response.json();
        return data;
             
    }

    async edit() {
        const session = new Session();
        const session_id = session.getSession();

        if (!session_id) {
            throw new Error('Session expired. Please login again.');
        }

        const username = this.username.trim();
        const email = this.email.trim();

        if (!username || !email) {
            throw new Error('Username and email are required.');
        }

        const currentResponse = await fetch(this.api_url + '/users/' + session_id);
        if (!currentResponse.ok) {
            throw new Error(`Failed to load current user. Status: ${currentResponse.status}`);
        }

        const currentUser = await currentResponse.json();

        const payload = JSON.stringify({
            username,
            email,
            password: currentUser.password
        });

        const updateResponse = await fetch(this.api_url + '/users/' + session_id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });

        if (!updateResponse.ok) {
            throw new Error(`Failed to update user. Status: ${updateResponse.status}`);
        }

        return updateResponse.json();
    }

    async deleteAccount() {
        const session = new Session();
        const session_id = session.getSession();

        if (!session_id) {
            throw new Error('Session expired. Please login again.');
        }

        const response = await fetch(this.api_url + '/users/' + session_id, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`Failed to delete profile. Status: ${response.status}`);
        }

        session.destroySession();
        return true;
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
