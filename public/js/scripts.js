window.onload = function (){
    animateText();
    document.querySelector("#btnSignUp").onclick = submit;
    document.querySelector("#btnLogIn").onclick = login;
};

//will run this on log in button clicked
//checks if all fields filled
//then requests the data given from db
//otherwise warns
const login = function(e){
    e.preventDefault();
    //preventdefault
    //check if inputs are all filled in
    if(checkLoginInputsFilled()){

        //if yes then request from db user with this un and pass
        //if exists then move to new page
        //if doesnt exist then say it doesnt exist
        onLoginSuccessful();

    }
    // else {
    //     //if not say something
    // }
};


//will run this on sign up button clicked, which checks if inputs are valid
// and if they are sends post req to db to save credentials
const submit = function (e){
    e.preventDefault();
    if (checkSubmitInputsFilled()){
        postSignUpCredentials()
    }
};

function postSignUpCredentials(){
    let a = {
        firstname: document.querySelector("#firstName").value,
        lastname: document.querySelector("#lastName").value,
        username: document.querySelector("#usernameSignUp").value,
        pass: document.querySelector("#passwordSignUp").value
    };
     console.log("posting ", a);
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(a),
        headers: { 'Content-Type': 'application/json' }
    })
}


//check that all inputs have been filled
function checkSubmitInputsFilled(){
    //first name
    let fname = document.getElementById("firstName").value;
    //last name
    let lname = document.getElementById("lastName").value;
    //email
    let username = document.getElementById("usernameSignUp").value;
    //two passwords
    let pwd = document.getElementById("passwordSignUp").value;
    let pwd2 = document.getElementById("passwordSignUpRepeat").value;
    if (fname !== "" && lname !== "" && username !== "" && pwd !== "" && pwd2 !== ""){
        //check passwords are the same
        return samePwds(pwd, pwd2);
    }
    return false
}


function samePwds(pwd1, pwd2){
    if(pwd1 === pwd2){
        return true
    } else{
        document.getElementById("authLabel").innerText = "Passwords don't match, try again!";
        document.getElementById("authLabel").setAttribute("style", "color: red !important");
        return false
    }
}



//function to check if all inputs are filled in on login
function checkLoginInputsFilled(){
    let username = document.querySelector("#usernameLogIn").value;
    let pass = document.querySelector("#passwordLogIn").value;
    const result = username !== "" && pass !== "" && username !== undefined && pass !== undefined;
    console.log("user and pass ", username, " ", pass, " not empty? ", result);
    return result;
}

function onLoginSuccessful(){
    let username = document.querySelector("#usernameLogIn").value;
    let pass = document.querySelector("#passwordLogIn").value;
    // let url = '/login?username='+username+'&pass='+pass;
    let a = {
        "username" : username,
        "pass" : pass
    };
    console.log("posting ", a);
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify(a),
        headers: { 'Content-Type': 'application/json' }
    }).then(res => window.location = '/authenticated');
}


//OTHER FUNCTIONS FOR LATER

//finds label associated with a certain element in document
function findLabelForControl(el) {
    let idVal = el.id;
    let labels = document.getElementsByTagName('label');
    for( let i = 0; i < labels.length; i++ ) {
        if (labels[i].htmlFor.toString() === idVal.toString()){
            return labels[i];
        }
    }
}

//title text js
// Wrap every letter in a span
function animateText() {
    let textWrapper = document.querySelector('.ml12');
    textWrapper.setAttribute("display", "hidden");
    setTimeout(function(){
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");

        anime.timeline({loop: false})
            .add({
                targets: '.ml12 .letter',
                translateX: [40,0],
                translateZ: 0,
                opacity: [0,1],
                easing: "easeOutExpo",
                duration: 2200,
                delay: (el, i) => 700 + 30 * i
            });
    }, 1000);
}