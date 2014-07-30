//Your custom JQuery goes here

/*
//------------------------------------------------------------
//EXAMPLE USE OF VALUE command, to test click on the white box
//------------------------------------------------------------

$(document).ready(function() {

$("body").append('<div class="ard value A0 mojaklasa">CLICK ME</div>')

$(".mojaklasa").click(function(event) {
		var value = $(this).attr("value");
		$("div").css('width', value);
		$("div").css('height', value);
	});
});

 
*/

$(document).ready(function() {
	$("body").append('<div class="mojaklasa">CLICK ME</div>')
	$(".mojaklasa").click(function() {
		$("div").css('width', analogpins[0]);
		$("div").css('height', analogpins[0]);
	});
});