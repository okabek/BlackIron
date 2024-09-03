var cost_val = 0;
var product_id = 0;
var seller_id = 0;

function open_purchase1()
{
    var purchase1 = document.getElementById("purchase1");
    purchase1.style.visibility = "visible";
}

function open_purchase2()
{
    var amount = document.getElementById("purchase_amount").value;
    var purchase2 = document.getElementById("purchase2");
    var msg1 = document.getElementById("msg1");

    if (amount == "")
    {
        return;
    }


    if (amount < -1000)
    {
        msg1.innerText = "You must buy at least 1000 robux.";
        msg1.style.color = "red";

        return;
    }
    else if (amount > Number(document.getElementById("stock")))
    {
        msg1.innerText = "There is not enough stock.";
        msg1.style.color = "red";

        return; 
    }


    msg1.innerText = "Enter the amount of robux you would like to buy.";
    msg1.style.color = "white";
    purchase2.style.visibility = "visible";
}


function open_purchase3()
{
    var gamepass_id = document.getElementById("gamepass").value;

    if (gamepass_id == "")
    {
        return;
    }


    fetch('http://127.0.0.1:5000/get_gamepass_status',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id: gamepass_id})
        }
    )
    .then(response => response.json())
    .then(data => 
        {
            var real_price = data['PriceInRobux'];
            var requested_price = document.getElementById("purchase_amount").value;
            var for_sale = data['IsForSale'];

            var msg2 = document.getElementById("msg2");
            var input = document.getElementById("gamepass");
            var msg4 = document.getElementById("msg4");

            if (real_price == requested_price)
            {
                if (for_sale)
                {
                    product_id = data['Creator']['ProductId'];
                    seller_id = data['Creator']['Id'];

                    document.getElementById("purchase3").style.visibility = "visible";
                    msg4.innerText = "USERNAME: " + data['Creator']['Name'] + " | GAMEPASS NAME: " + data['Name']
                    msg2.style.color = "white";
                }
                else 
                {
                    msg2.innerText = "The gamepass is not for sale!";
                    msg2.style.color = "red";
                    input.value = "";
                }
            }
            else 
            {
                msg2.innerText = "The gamepass needs to cost exactly " + requested_price + "!";
                msg2.style.color = "red";
                input.value = "";
            }
        }
    )
}


function open_purchase4()
{
    var amount = document.getElementById("purchase_amount").value;
    var msg5 = document.getElementById("msg5");

    msg5.innerText = "[YOU WILL RECEIVE " + Math.round(amount * 0.7) + " ROBUX AFTER TAX]";
    document.getElementById("purchase4").style.visibility = "visible";
}


function open_purchase5()
{
    fetch('http://127.0.0.1:5000/get_payment',
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({gamepass_id: document.getElementById("gamepass").value, robux: document.getElementById("purchase_amount").value, sellerid: seller_id})
        }
    )
    .then(response => response.json())
    .then(data =>
        {
            console.log(data);
            window.open(data, '_self');
        }
    )
}


function calc_cost()
{
    var amount = document.getElementById("purchase_amount").value;
    var cost = document.getElementById("cost");

    cost_val = Math.round(amount * (4 / 1000));
    cost.innerText = "Price: $" + cost_val;
}


function create_feed(data, i)
{
    split = data.split("|")
    live_feed = document.getElementById("live_feed");

    const list_object = document.createElement("li");
    list_object.style.marginRight = "60px";
    list_object.style.marginLeft = "-40px";
    list_object.id = "feed" + i;
    list_object.setAttribute("transaction_id", split[1])

    const container = document.createElement("div");
    container.className = "showcase";
    
    const img = document.createElement("img");
    img.src = "robux_icon.png"; 
    img.style.height = "40px";
    img.style.position = "relative";
    img.style.left = "-4%";
    img.style.top = "15%";

    const txt = document.createElement("i");
    txt.style.position = "relative";
    txt.style.top = "-10%";
    txt.id = "feed_msg" + i;
    txt.textContent = split[0] + " Robux recently sold";

    container.appendChild(img);
    container.appendChild(txt);
    list_object.appendChild(container);
    live_feed.insertBefore(list_object, live_feed.firstChild);
}


function setup_live_feed()
{
    fetch('http://127.0.0.1:5000/get_live_feed',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    .then(response => response.json())
    .then(data => 
        {
           for (i = 0; i < 10; i++)
           {
            create_feed(data[i], i);
           }
        }
    )
}


function update_live_feed()
{
    fetch('http://127.0.0.1:5000/get_live_feed',
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }
    )
    .then(response => response.json())
    .then(data => 
        {
          for (i = 0; i < data.length; i++)
          {
            feed = document.getElementById("feed" + i);
            transaction_id = feed.getAttribute("transaction_id");
            split = data[i].split("|");

            if (split[1] == "null")
            {
                msg = document.getElementById("feed_msg" + i).innerText = split[0] + " Robux was recently sold";
            }
            else if (transaction_id != split[1])
            {
                msg = document.getElementById("feed_msg" + i).innerText = split[0] + " Robux was recently sold";
            }
          }
        }
    )
}


function get_stock()
{
    fetch('http://127.0.0.1:5000/get_stock',
        {
            method: 'GET',
            headers: 
            {
                'Content-Type': 'application/json'
            }
        }
    )
    .then(response => response.json())
    .then(data =>
        {
            document.getElementById("stock").innerText = data["total"];
            document.getElementById("accounts").innerText = "[ACROSS " + data["accounts"] + " ACCOUNTS]";
        }
    )
}


function open_sell1()
{
    var element = document.getElementById("sell1");
    element.style.visibility = "visible";
}


function open_sell2()
{
    var msg6 = document.getElementById("msg6");
    var msg7 = document.getElementById("msg7");

    fetch('http://127.0.0.1:5000/check_cookie', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(document.getElementById("cookie").value)
        }
    )
    .then(response => response.json())
    .then(data =>
        {
            if (data == "error")
            {
                msg6.innerText = "COOKIE INVALID!";
                msg6.style.color = 'red';
            }
            else if (data == "already")
            {
                msg6.innerText = "ACCOUNT ALREADY LISTED!";
                msg6.style.color = 'red';
            }
            else 
            {
                var robux = data['robux'];

                if (robux < -1000)
                {
                    msg6.innerText = "ACCOUNT MUST HAVE AT LEAST 1000 ROBUX!";
                    msg6.style.color = 'red';

                    return;
                }

                
                msg6.innerText = "Enter the cookie to your account with robux below. It should start with '_|WARNING:'";
                msg6.style.color = 'white';
                msg7.innerText = "USERNAME: " + data['name'] + " | ROBUX: " + robux;
                document.getElementById("sell1").style.visibility = "hidden";
                document.getElementById("sell2").style.visibility = "visible";
            }
        }
    )
}


function open_sell3()
{
    fetch('http://127.0.0.1:5000/check_address',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({cookie: document.getElementById("cookie").value, address: document.getElementById("address").value})
        }
    )
    .then(response => response.json())
    .then(data =>
        {
            var msg8 = document.getElementById("msg8");

            if (data == "valid")
            {
                msg8.innerText = "Enter your LTC wallet address below.";
                msg8.style.color = "white";

                document.getElementById("sell2").style.visibility = 'hidden';
                document.getElementById("sell3").style.visibility = 'visible';
            }
            else 
            {
                msg8.innerText = "Wallet address is not valid!";
                msg8.style.color = "red";
            }
        }
    )
}


function open_remove1()
{
    var purchase1 = document.getElementById("remove1");
    purchase1.style.visibility = "visible";
}


function open_remove2()
{
    fetch("http://127.0.0.1:5000/remove_cookie",
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(document.getElementById("cookie2").value)
        }
    )
    .then(response => response.json())
    .then(data =>
        {
            msg9 = document.getElementById("msg9");

            if (data == "true")
            {
                msg9.innerText = "Enter the cookie of the account you want to remove.";
                msg9.style.color = "white";
                document.getElementById("remove2").style.visibility = 'visible';
            }
            else 
            {
                msg9.innerText = "Cookie was not found!";
                msg9.style.color = "red";
            }
        }
    )

    var purchase1 = document.getElementById("remove1");
    purchase1.style.visibility = "visible";
}

// 

get_stock();
setup_live_feed();
setInterval(update_live_feed, 1000);
setInterval(get_stock, 1000);
