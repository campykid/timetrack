var qs = require('querystring');
var fs = require('fs');
exports.sendHtml = function(res, html) { 
	//res.setHeader('Content-Type', 'text/html');
	//res.setHeader('Content-Length', Buffer.byteLength(html));
	res.end(html);
}

exports.parseReceivedData = function(req, cb) { 
	var body = '';
	req.setEncoding('utf8');
	req.on('data', function(chunk){ body += chunk });
	req.on('end', function() {
		var data = qs.parse(body);
		cb(data);
	});
};

exports.actionForm = function(id, path, label) { 
	var html = '<form method="POST" action="' + path + '">' +
		'<input type="hidden" name="id" value="' + id + '">' +
		'<input type="submit" value="' + label + '" />' +
		'</form>';
	return html;
};

exports.add = function(db, req, res) {
	exports.parseReceivedData(req, function(work) { 
		db.query(
			"INSERT INTO work (hours, date, description) " + 
			" VALUES (?, ?, ?)",
			[work.hours, work.date, work.description], 
			function(err) {
				if (err) throw err;
				exports.show(db, res); 
			}
		);
	});
};

exports.delete = function(db, req, res) {
	exports.parseReceivedData(req, function(work) { 
		db.query(
			"DELETE FROM work WHERE id=?", 
			[work.id], 
			function(err) {
				if (err) throw err;
				exports.show(db, res); 
			}
		);
	});
};

exports.archive = function(db, req, res) {
	exports.parseReceivedData(req, function(work) { 
		db.query(
			"UPDATE work SET archived=1 WHERE id=?", 
			[work.id], 
			function(err) {
				if (err) throw err;
				exports.show(db, res); 
			}
		);
	});
};

exports.show = function(db, res, showArchived) {
	var query = "SELECT * FROM work " + 
		"WHERE archived=? " +
		"ORDER BY date DESC";
	var archiveValue = (showArchived) ? 1 : 0;
	db.query(
		query,
		[archiveValue], 
		function(err, rows) {
			if (err) throw err;
			html = (showArchived)
				? ''
				: '<a href="/archived">Archived Work</a><br/>';
			html += exports.workHitlistHtml(rows); 
			html += exports.workFormHtml();
			exports.sendHtml(res, html); 

		}
	);
};

exports.showArchived = function(db, res) {
	exports.show(db, res, true); 
};

exports.workHitlistHtml = function(rows) {
	var html = '';
	for(var i in rows) {
		html += '<div class="demo-card-wide mdl-card mdl-shadow--2dp">';
		html += '<div class="mdl-card__title"><h2 class="mdl-card__title-text">' + rows[i].date + '</h2></div>';
		html += '<div class="mdl-card__supporting-text">'+ rows[i].description +'</div>';
		html += '<div class="mdl-card__actions mdl-card--border"><p class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">'
				+ rows[i].hours + '</p></div>'
		html += exports.workDeleteForm(rows[i].id)
		html += '</div>';
	}

	// 	<div class="mdl-card__title">
	// 		<h2 class="mdl-card__title-text">07.01.2016</h2>
	// 	</div>
	// 	<div class="mdl-card__supporting-text">
	// 		Это было знойным летом
	// 	</div>
	// 	<div class="mdl-card__actions mdl-card--border">
	// 		<p class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">
	// 			3 часа
	// 		</p>
	// 	</div>
	// 	<div class="mdl-card__menu">
	// 		<button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">
	// 			<i class="material-icons">remove_circle</i>
	// 		</button>
	// 	</div>
	// </div>



// for(var i in rows) { 
// 		html += '<tr>';
// 		html += '<td>' + rows[i].date + '</td>';
// 		html += '<td>' + rows[i].hours + '</td>';
// 		html += '<td>' + rows[i].description + '</td>';
// 		if (!rows[i].archived) { 
// 			html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
// 		}
// 		html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
// 		html += '</tr>';
// 	}




	// var html = '<table>';
	// for(var i in rows) { 
	// 	html += '<tr>';
	// 	html += '<td>' + rows[i].date + '</td>';
	// 	html += '<td>' + rows[i].hours + '</td>';
	// 	html += '<td>' + rows[i].description + '</td>';
	// 	if (!rows[i].archived) { 
	// 		html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
	// 	}
	// 	html += '<td>' + exports.workDeleteForm(rows[i].id) + '</td>';
	// 	html += '</tr>';
	// }
	// html += '</table>';
	return html;
};

exports.workFormHtml = function() {
	// var html = '<form method="POST" action="/">' + 
	// 	'<p>Date (YYYY-MM-DD):<br/><input name="date" type="text"><p/>' +
	// 	'<p>Hours worked:<br/><input name="hours" type="text"><p/>' +
	// 	'<p>Description:<br/>' +
	// 	'<textarea name="description"></textarea></p>' +
	// 	'<input type="submit" value="Add" />' +
	// 	'</form>';
	return fs.readFileSync('./public/index.html').toString();
};

exports.workArchiveForm = function(id) { 
	return exports.actionForm(id, '/archive', 'Archive');
}

exports.workDeleteForm = function(id) { 

	var html = '<form method="POST" action="/delete" style="display: inline;">' +
		'<input type="hidden" name="id" value="' + id + '">' +
		'<div type="submit" class="mdl-card__menu"><button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect">	<i class="material-icons">remove_circle</i></button></div>' +
		'</form>';
	return html;
	// return exports.actionForm(id, '/delete', 'Delete');
	
}
