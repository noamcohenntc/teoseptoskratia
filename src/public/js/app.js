$("#create_coin_btn").on("click",()=>{
    document.location = "/" + $("#coin_name").val() + "/home";
})