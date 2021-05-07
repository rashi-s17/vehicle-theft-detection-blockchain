const login_form = document.getElementById('login')
if(login_form) {
    login_form.addEventListener('submit', login)
}

async function login(event) {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

	const pass = localStorage.getItem(username) 
    console.log(pass);

	if (pass != password) {
		Swal.fire("Invalid username/password");
	}
    else {
        window.location = "./vehicle.html";
    }
}

const signup_form = document.getElementById('signup')
if(signup_form){
    signup_form.addEventListener('submit', signup)
}

async function signup(event) {
    event.preventDefault()
    const username = document.getElementById('username').value
    const password = document.getElementById('password').value

	const user = localStorage.getItem("username")
    console.log(user);

	if (!user) {
        localStorage.setItem(username, password);
        window.location = "./index.html";
    }
    else {
        Swal.fire("Username already in use")
    }
}
