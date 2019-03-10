$ (function (){

	function disableScroll ()
	{
		$('html, body').on('mousewheel',function(){
			return false;
		});
	}

	function enableScroll()
	{
		$('html, body').off('mousewheel');
	}

	$('main').on("click", "button.click", function(){
			$('.popup-container').fadeIn(400, disableScroll);
			$('.popup').animate(400);
			$('body').addClass('stop-scrolling');
			$('body').bind('touchmove', function(e){e.preventDefault()});
    });

	/*$('.click')
		.click(function(){
			$('.popup-container').fadeIn(400, disableScroll);
			$('.popup').animate(400);
			$('body').addClass('stop-scrolling');
			$('body').bind('touchmove', function(e){e.preventDefault()});

	});*/

	$('.popup-container').click(function(event){
			if (event.target == this) {
				$(this).fadeOut(400, enableScroll);
				$('.popup').animate(400);
		};
		$('body').unbind('touchmove')

	})
});
