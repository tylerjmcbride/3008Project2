var password = "#{password}"
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

var html = '';

for (i=0, a = password.length; i < a; i++) {
	html += '<img src="'+emojis.path+emojis.icons[password[i]]+'" alt="" class="img-rounded" style="cursor: pointer;width: '+100/password.length+'%;height: auto;">';
}

$( document ).ready(function() {
	$('#passwordDiv').html(html);
});

