var cost_val = 0;

function open_purchase()
{
    var purchase = document.getElementById("purchase");

    purchase.style.visibility = "visible";
}

function open_purchase2()
{
    var amount = document.getElementById("purchase_amount").value;
    var purchase = document.getElementById("purchase2");
    var msg1 = document.getElementById("msg1");

    if (amount < 1000)
    {
        msg1.innerText = "YOU MUST BUY AT LEAST 1000 ROBUX.";

        return;
    }


    msg1.innerText = "Enter the amount of robux you would like to buy.";
    purchase.style.visibility = "visible";
}


function open_purchase3()
{
    var gamepass_id = document.getElementById("gamepass").value;
    var url = "https://apis.roblox.com/game-passes/v1/game-passes/" + gamepass_id + "/product-info";
    var json 

    fetch(url, {method: 'GET',
        headers: {'Content-Type': 'application/json'}}).then(json => json.json());
    console.log(json)
}


function calc_cost()
{
    var amount = document.getElementById("purchase_amount").value;
    var cost = document.getElementById("cost");

    cost_val = Math.round(amount * (4 / 1000));
    cost.innerText = "Price: $" + cost_val;
}

