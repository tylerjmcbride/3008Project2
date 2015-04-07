$(document).ready(function() {
	$('[data-toggle="popover"]').popover({
		html: true
	});

	$('#browserData').val(navigator.userAgent);
			
	$(document).on('click', function (e) {
		$('[data-original-title]').each(function () {
			if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0 && 
				 $('.input-group-addon-backspace').has(e.target).length === 0) {
				   $(this).popover('hide');
			}
		});
	});
			
	$('.input-group-addon-backspace').on('click', function(e) {
		var password = $('#password').val();
		if(password.length > 0) {
			$('#password').val(password.substring(0, password.length-1));
		}
	});
			
	var emojis = {};
	emojis.path = 'packs/basic/images/';
	emojis.icons = {
		'a' : 'bowtie.png',
		'b' : 'smile.png',
		'c' : 'laughing.png',
		'd' : 'blush.png',
		'e' : 'smiley.png',
		'f' : 'relaxed.png',
		'g' : 'smirk.png',
		'h' : 'heart_eyes.png',
		'i' : 'kissing_heart.png',
		'j' : 'kissing_closed_eyes.png',
		'k' : 'flushed.png',
		'l' : 'relieved.png',
		'm' : 'satisfied.png',
		'n' : 'grin.png',
		'o' : 'wink.png',
		'p' : 'stuck_out_tongue_winking_eye.png',
		'q' : 'stuck_out_tongue_closed_eyes.png',
		'r' : 'grinning.png',
		's' : 'kissing.png',
		't' : 'kissing_smiling_eyes.png',
		'u' : 'stuck_out_tongue.png',
	};
			
	icons = '';
			
	for (var key in emojis.icons) {
		var obj = emojis.icons[key];
		icons += '<img src="'+emojis.path+obj+'" alt="'+key+'" class="img-rounded" style="cursor: pointer;width: 14.28%;height: auto;">';
	}
			
	$('#password').attr('data-content', icons);
			
	$('body').on('click', '.popover-content > img', function() {
		$('#password').val($('#password').val() + $(this).attr("alt"));
	});
});
