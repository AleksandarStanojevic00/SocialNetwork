let session = new Session();
session=session.getSession();
if(session !== '') {
    alert('You are already logged in!');
}else {
    window.location.href = '/';
}