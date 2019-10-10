var config = {
    apiKey: "AIzaSyDP8V8qW35Sc-fXMdKRPcC3SG0SBxShBQk",
    authDomain: "rockpaperscissors-94349.firebaseapp.com",
    databaseURL: "https://rockpaperscissors-94349.firebaseio.com",
    projectId: "rockpaperscissors-94349",
    storageBucket: "",
    messagingSenderId: "948732802017",
    appId: "1:948732802017:web:ab38ba34c528882d2518a0",
    measurementId: "G-E6FFPT0G1M"
};

firebase.initializeApp(config);


// Create a variable to reference the database.
var database = firebase.database();
var playerNumber = 1;
var userName;
var player1Selection;
var player2Selection;
var wins = 0;
var ties = 0;
var losses = 0;
var gameOver = false;

$(document).ready(function () {

    var chatRef = database.ref("/chat");
    var connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes. '.info/connected' is a
    // boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");
    //holds reference to users section
    var userRef = database.ref("/users");
    
    // When first loaded or when the connections list changes...
    connectionsRef.on("value", function (snapshot) {
        playerNumber = snapshot.numChildren();
        // Display the viewer count in the html. The number of online users is the
        // number of children in the connections list.
        $("#usersConnected").text(snapshot.numChildren() + " Users Connected");
    });

    // When the client's connection state changes...
    connectedRef.on("value", function (snap) {
        // If they are connected..
        if (snap.val()) {
            // Add user to the connections list.
            var con = connectionsRef.push(true);

            userName = prompt("Welcome! Please enter Your Name");
            // Code for handling the push
            userRef.child(userName).set({ userName: userName });
            // Remove user from the connection list and userRef when they disconnect.
            con.onDisconnect().remove();
            userRef.child(userName).onDisconnect().remove();
        }
    });

    userRef.on("child_added", function (childSnapshot) {
        //if player1 is empty then fill with user
        if ($("#player1Name").text() == "Player 1") {
            //set player1Name to username
            $("#player1Name").text(childSnapshot.val().userName);
            //checks if the current username = the user
            if (userName == childSnapshot.val().userName) {
                //removes all Player2 buttons
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").removeClass("btn-primary");
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").addClass("btn-danger");
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").attr("disabled", true);
            }
        } else if ($("#player2Name").text() == "Player 2") {
            //add player2 username
            $("#player2Name").text(childSnapshot.val().userName);
        }

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    $("#player1BtnRock,#player1BtnPaper,#player1BtnScissors").on("click", function () {
        //sets player1Selection for pushing to db
        player1Selection = $(this).text();
        //sets image online to picked
        $("#player1Image").attr("src", "assets/images/picked.png");
        //references value change in db
        userRef.on("value", function (snapshot) {
            if (!gameOver) {
                var usersObject = snapshot.val();
                //loops through each userObject child
                Object.keys(usersObject).forEach(function (key) {
                    var userHold = usersObject[key].userName;
                    //if child is userName then update the selection and set picked to true
                    if (userHold == userName) {
                        userRef.child(key).set({ userName: userHold, userSelect: player1Selection, userPicked: true });
                    }
                });
            }
        });
    });

    //fires any time userRef value cahnges in db
    userRef.on("value", function (snapshot) {
        var usersObject = snapshot.val();
        //sets player2 name to variable for pull
        var playerTwo = $("#player2Name").text();

        Object.keys(usersObject).forEach(function (key) {
            var userHold = usersObject[key].userName;
            //if userHold = player2 then update db with selection
            if (userHold == playerTwo) {
                var player2Picked = usersObject[key].userPicked;
                //sets player2 image to picked and update the userselect
                if (player2Picked && !gameOver && usersObject[key].userSelect != "") {
                    $("#player2Image").attr("src", "assets/images/picked.png");
                    player2Selection = usersObject[key].userSelect;
                }
            }
        });

        //checks if both selections are in and completes game if both exist
        if ($("#player1Image").attr("src") == "assets/images/picked.png" && $("#player2Image").attr("src") == "assets/images/picked.png") {
            //sets gameOver to true
            gameOver = true;
            //runs RPS logic to decide tie, win, or loss and updates DOM
            if (player1Selection === player2Selection) {
                ties++;
                $("#player1Ties").text("Ties: " + ties);
            } else if ((player1Selection === "Rock" && player2Selection === "Scissors") || (player1Selection === "Scissors" && player2Selection === "Paper")
                || (player1Selection === "Paper" && player2Selection === "Rock")) {
                wins++;
                $("#player1Wins").text("Wins: " + wins);
            } else if ((player2Selection === "Rock" && player1Selection === "Scissors") || (player2Selection === "Scissors" && player1Selection === "Paper")
                || (player2Selection === "Paper" && player1Selection === "Rock")) {
                losses++;
                $("#player1Losses").text("Losses: " + losses);
            }
            //shows player1 and player2 selections for other user
            $("#player1Image").attr("src", "assets/images/"+player1Selection+".png");
            $("#player2Image").attr("src", "assets/images/"+player2Selection+".png");

            //resets player1 and player2 selections
            player1Selection = "";
            player2Selection = "";

            var usersObject2 = snapshot.val();
            //loop through objects and set user and opponent's selections to null
            Object.keys(usersObject2).forEach(function (key) {
                var userHold = usersObject2[key].userName;
                if (userHold == userName || userHold == playerTwo) {
                    userRef.child(key).set({ userName: userHold, userSelect: null, userPicked: false });
                }
            });
            //disables user buttons for one second
            $("#player1BtnRock,#player1BtnPaper,#player1BtnScissors").attr("disabled", true);

            setTimeout(function () {
                //resets game
                gameOver = false;
                //changes images back to placeholders
                $("#player1Image,#player2Image").attr("src", "assets/images/placeholder.png");
                $("#player1BtnRock,#player1BtnPaper,#player1BtnScissors").attr("disabled", false);
            }, 1000);
        }

    });

    //fires on chat button click
    $("#btnChat").on("click", function () {
        //push messages to firebase
        chatRef.push(userName + ": " +$("#textboxUser").val());
    });

    //fires whenever a chat is added to firebase
    chatRef.on("child_added", function (childSnapshot) {
        //creates new h5 and adds new chat to DOM
        var newChat = $("<h5>");
        newChat.text(childSnapshot.val());
        $("#chatBox").prepend(newChat);
    });
});