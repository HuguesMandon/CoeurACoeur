//Initialisation of the localStorage (if empty) and of storage_items, used everywhere in profiles.
function localStorageInitialisation(){
	window.storage_items = {name: "Name", gender: "♀️ ♂️ ⚧️", work: "Work", city:"City", bio_short: "blablabla", birthday:"2000/01/01", profile_picture: "TODO", long_bio: "blaablaablaa", peer_id: window.peer.id};
	for (item in window.storage_items){
		if (localStorage.getItem(item)===null){
			localStorage.setItem(item, window.storage_items[item]);		
		}
	}
}

//Initialize the filters events and load them from local storage
function initializeFilters(){
	window.filters = ["research_gender"];
	for (filter of window.filters){
		el = document.getElementById(filter);
		el.addEventListener('focusout',saveLocally);
		if (localStorage.getItem(filter)){
			el.innerHTML = localStorage.getItem(filter);
		}
	}
}

//small function to show and hide an element
function showHide(el_id){
	el = document.getElementById(el_id);
	if (el.style.display === "none"){
		el.style.display = "inline-block";
	} else {
		el.style.display = "none" ;
	}
}

//Generate a single "mosaic" profile for quickview
function showMosaicProfile(profile){
	//Only show profile if it corresponds to the user's filters
	for (filter of window.filters){
		var profile_item = filter.slice(filter.indexOf('_') + 1);
		if (localStorage.getItem(filter) && !profile[profile_item].includes(localStorage.getItem(filter))){
			return;
		}
	}
	//Keep the peer in sessionStorage for global matching
	/**targets = sessionStorage.getItem("targets");
	if (!targets[profile.peer_id]){
		targets[profile.peer_id] = profile;
	}**/
	//Create the mosaic in the profileList
	const node = document.createElement("div");
	node.classList.add("3u");
	var profile_link = '#profile';
	var profile_escaped = {} ;
	for (key of Object.keys(profile)){
		if (typeof profile[key] === 'string'){
			profile_escaped[key] = escape(profile[key]);
		} else {
			profile_escaped[key] = profile[key];
		}
	}
	var profile_data_string =  (JSON.stringify(profile_escaped));
	node.innerHTML = '<section><h2 class="title"><span style="display: flex;justify-content: space-between;"><p>'+profile.name+'</p><p>'+profile.gender+'</p></span></h2>'+
			'<h3>'+profile.work+' in '+profile.city+', born '+profile.birthday+'</h3>'+'<p>&nbsp;</p>'+
            '<p class="subtitle">'+profile.bio_short+'</p>'+
			//'<p><a href="#profile">'+profile.profile_picture+'</a></p>'+ //<img src="images/pics02.jpg" alt="">
            '<p class="button-style1"><a href="#profile"' + "onclick='fillProfile("+profile_data_string+")'>Detailed profile</a><span id='good_bet_"+profile.peer_id+"'></span></p></section>";
	document.getElementById("profileList").appendChild(node);
}

//Fills the profile "page", either with user's profile (editable, when profile is NULL) or with the profile the user is viewing
function fillProfile(profile=null){
	if (profile){
		for (key of Object.keys(profile)){
			if (typeof profile[key] === 'string'){
				profile[key] = unescape(profile[key]);
			}
		}
		document.getElementById("peer_id").innerHTML = profile["peer_id"];
	}	
	for (item of Object.keys(storage_items)){
		var item_value ;
		if (profile){
			if (profile[item]){
				item_value = profile[item];
			} else {
				item_value = "error";
			}
		} else {
			item_value = localStorage.getItem(item);
		}
		if (document.getElementById(item)){
			el = document.getElementById(item);
			el.innerHTML = item_value;
			if (profile){
				el.contentEditable = false;
				el.removeEventListener('focusout', saveLocally);
			} else {
				el.contentEditable = true;
				el.addEventListener('focusout',saveLocally);
			}
		}
	}
	//Looking for
	var looking_for_list = "";
	for (filter of window.filters){
		var filter_value ;
		if (profile){
			filter_value = profile[filter];
		} else {
			filter_value = localStorage.getItem(filter)
		}
		if (filter_value){
			looking_for_list+="<li>"+filter.slice(filter.indexOf('_') + 1)+": "+filter_value+"</li>";
		}
	}
	document.getElementById("filters_list").innerHTML = looking_for_list;
	if (profile){
		document.getElementById("tchat").style.display = "block";
	} else {
		document.getElementById("tchat").style.display = "none"; 
		document.getElementById("tchat_functions").style.display = "none";
	}
}

//Used in the event listener to save the user's data
function saveLocally(){
	if (this.textContent){
		localStorage.setItem(this.id,this.textContent);
	}
}

//TODO: use clicks data, clicks on the tchat button and tchats sent. Later on, get preferences from similar profiles and add them to the mix (or suggest them)
function computePreferences(){
	
}

//Gale-Shapley stable marriages as given in Wikipedia, but translated to JavaScript
function matchGaleShapley(){
	//Instead of men and women, which won't be the case, I'm using "respectively" arrows and hearts, as each user will be an arrow, and the people they are looking at are hearts
	// TODO: get arrows, hearts, and their respective preferences
	var arrows ;
	var hearts ;
	var arrowPreferences ;
	var heartPreferences ;
	var next = [];
	var current = [];
	var free = [];
	for (i of Object.keys(arrows)){ //arrows must be an array
		free.unshift(arrows[i]);
		next[i] = 0;
		current[i] = 0;
	}
	while (free.length > 0){
		var a = free[0];
		var h = arrowPreferences[a-1][next[a-1]];
		if (current[h-1]==0){
			current[h-1] = a;
			free.shift();
		} else {
			var i = 0;
			var arrow0 = current[h-1];
			while (heartPreferences[h-1][i] != a && arrowPreferences[h-1][i] != arrow0){
				i++;
			}
			if (arrowPreferences[h-1][i] == a){
				current[h-1] = a;
				free.shift();
				free.unshift(arrow0);
			}
		}
		next[a-1]++;
	}
	return current;
}