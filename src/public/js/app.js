$.extend({
    jpost: function(url, body) {
        return $.ajax({
            type: 'POST',
            url: url,
            data: JSON.stringify(body),
            contentType: "application/json",
            dataType: 'json'
        });
    }
});

$("#create_coin_btn").on("click",()=>{
    if($("#coin_name").val() !== "")
        document.location = "/" + $("#coin_name").val() + "/home?new=true";
});
$("#login").on("click",()=>{
    if($("#coin_name").val() !== "")
        document.location = "/" + $("#coin_name").val() + "/home";
});

$("#mine_btn").on("click",()=>{
    $.post("mine",{
        amount:parseFloat($("#coins_to_mine").val())
    },(res)=>{
        $("#coins_in_eco").html(res.coinsInEco);
        $("#coins_in_wallet").html(res.coinsInWallet);
        $("#time_ms").html(" CPU Time: " + res.nonce.cpu + "µs");

        res.accounts.forEach((account)=>{
            let id = account.name.replace("@","-")
            if($("#bank #account_" + id).length===0)
                return;//$("#bank").append('<div id="account_'+id+'"></div>')
            $("#bank #account_" + id).html(account.coins);
        })
    })
})

$("#transfer_btn").click(()=>{
    const from = $("#coin_name").text().split("@")[0];
    const transactions = [];
    $(".amount").each((index,e)=>{
        const to = $(e).attr("id").split("input_")[1];
        const amount = $(e).val();
        if(amount !=="" && !isNaN(amount))
            transactions.push({from,to,amount:parseFloat(amount)})
    });
    if(transactions.length===0)
        return;
    
    $.jpost("transactions",{transactions}).then((res)=>{
        $("#transfer_cpu").html(" CPU Time: " + res.cpu + "µs")
        res.sums.forEach((sum)=>{
            $("#account_" + sum.name).html(sum.sum);
        })
    })
})