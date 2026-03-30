let session = new Session();
session_id = session.getSession();
if(session_id !== "") {
    
    async function populateUserData() {
        let user = new User();
        user = await user.get(session_id);

        document.querySelector('#username').innerText = user['username'];
        document.querySelector('#email').innerText = user['email'];
    }
    populateUserData();
}else {
    window.location.href = "/";
}

document.querySelector('#logout').addEventListener('click', e => {
    e.preventDefault();

    session.destroySession();
    window.location.href = "/";
});