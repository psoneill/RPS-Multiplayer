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

    var connectionsRef = database.ref("/connections");

    // '.info/connected' is a special location provided by Firebase that is updated
    // every time the client's connection state changes. '.info/connected' is a
    // boolean value, true if the client is connected and false if they are not.
    var connectedRef = database.ref(".info/connected");

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
            database.ref().push({ userName: userName });
            // Remove user from the connection list when they disconnect.
            con.onDisconnect().remove();
        }
    });

    database.ref().on("child_added", function (childSnapshot) {
        if ($("#player1Name").text() == "Player 1") {
            $("#player1Name").text(childSnapshot.val().userName);
            if (userName == childSnapshot.val().userName) {
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").removeClass("btn-primary");
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").addClass("btn-danger");
                $("#player2BtnRock,#player2BtnPaper,#player2BtnScissors").attr("disabled", true);
            }
        } else if ($("#player2Name").text() == "Player 2") {
            $("#player2Name").text(childSnapshot.val().userName);
        }

        // Handle the errors
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });

    $("button").on("click", function () {
        player1Selection = $(this).text();
        $("#player1Image").attr("src", "assets/images/picked.png");
        database.ref().on("value", function (snapshot) {
            if (!gameOver) {
                var usersObject = snapshot.val();
                Object.keys(usersObject).forEach(function (key) {
                    var userHold = usersObject[key].userName;
                    if (userHold == userName) {
                        database.ref(key).set({ userName: userHold, userSelect: player1Selection, userPicked: true });
                    }
                });
            }
        });
    });

    database.ref().on("value", function (snapshot) {
        var usersObject = snapshot.val();
        var playerTwo = $("#player2Name").text();

        Object.keys(usersObject).forEach(function (key) {
            var userHold = usersObject[key].userName;

            if (userHold == playerTwo) {
                var player2Picked = usersObject[key].userPicked;
                if (player2Picked && !gameOver && usersObject[key].userSelect != "") {
                    $("#player2Image").attr("src", "assets/images/picked.png");
                    player2Selection = usersObject[key].userSelect;
                }
            }
        });

        if ($("#player1Image").attr("src") == "assets/images/picked.png" && $("#player2Image").attr("src") == "assets/images/picked.png") {
            gameOver = true;
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

            $("#player1Image").attr("src", "assets/images/"+player1Selection+".png");
            $("#player2Image").attr("src", "assets/images/"+player2Selection+".png");
            player1Selection = "";
            player2Selection = "";

            var usersObject2 = snapshot.val();
            Object.keys(usersObject2).forEach(function (key) {
                var userHold = usersObject2[key].userName;
                if (userHold == userName || userHold == playerTwo) {
                    database.ref(key).set({ userName: userHold, userSelect: null, userPicked: false });
                }
            });
            $("#player1BtnRock,#player1BtnPaper,#player1BtnScissors").attr("disabled", true);

            setTimeout(function () {
                gameOver = false;
                $("#player1Image,#player2Image").attr("src", "assets/images/placeholder.png");
                $("#player1BtnRock,#player1BtnPaper,#player1BtnScissors").attr("disabled", false);
            }, 1000);
        }

    });
});