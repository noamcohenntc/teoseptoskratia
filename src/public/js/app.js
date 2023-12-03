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
        $("#time_ms").html(res.nonce.cpu + "µs");

        res.accounts.forEach((account)=>{
            let id = account.name.replace("@","-")
            if($("#bank #account_" + id).length===0)
                return;//$("#bank").append('<div id="account_'+id+'"></div>')
            $("#bank #account_" + id).html(account.coins);
        })
    })
})