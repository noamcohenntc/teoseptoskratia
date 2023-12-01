$("#create_coin_btn").on("click",()=>{
    document.location = "/" + $("#coin_name").val() + "/home";
})
$("#mine_btn").on("click",()=>{
    $.post("mine",{
        amount:parseFloat($("#coins_to_mine").val())
    },(res)=>{
        $("#coins_in_eco").html(res.coinsInEco);
        $("#coins_in_wallet").html(res.coinsInWallet);
        $("#time_ms").html(res.nonce.duration + "ms");
    })
})