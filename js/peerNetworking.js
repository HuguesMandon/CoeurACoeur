var debug = true;
var conn ;

//Peer-to-peer initialisation ("open")
function peerNetworkingInitialisation(){
	var peer;
	if (localStorage.getItem("peer_id")!==null){
		peer =  new Peer(JSON.parse(localStorage.getItem("peer_id")));
	} else {
		randomNumber = Math.random()*10000000000;
		peer = new Peer(randomNumber.toString().substring(0,8));
	}
	window.peer = peer;
	if (debug){console.log(peer);}
	window.peers_list = ["51811290"];
	peer.on('open', function(id) {
		generateProfilesList();
		handleConnections(peer);
	});
}

//On external connection, send profile data and treat incomming data
function handleConnections(peer){
	peer.on('connection', function(peer_data_connection){	
		peer_data_connection.on('open', function(){
			peer_data_connection.send(generateProfileData());
			
			peer_data_connection.on('data', function(profile_data) {
			  if (debug){console.log('Received2:'+ JSON.stringify(profile_data));}
			  if (!window.peers_list.includes(profile_data.peer_id)){
				  console.log(profile_data.peer_id);
				  window.peers_list.push(profile_data.peer_id);
				  console.log(window.peers_list);
			  }
			});
		
		});
	});
}

//Sending data to other peers with your info
function sendProfileData(peer_data_connection){
	data = generateProfileData();
	peer_data_connection.on('open',function(){
		peer_data_connection.send(data);
		if (debug){console.log("data sent:"+JSON.stringify(data));}
	});
}

//Creates the data to be sent to others from localstorage and window
function generateProfileData(){
	var data = {peers_list: window.peers_list};
	for (item in window.storage_items){
		data[item] = localStorage.getItem(item);
	}
	for (filter of window.filters){
		data[filter] = localStorage.getItem(filter);
	}
	console.log(data);
	return data;
}

//Connect to all peers and generate their profiles.
function generateProfilesList(){
	var peer = window.peer;
	document.getElementById("profileList").innerHTML = '';
	var peers = {};
	for (peer_id of window.peers_list){
		if (peer_id != peer.id){
			if (debug){console.log(peer_id);}
			const dataConnection = peer.connect(peer_id);
			dataConnection.on('open', function() {
				dataConnection.send(generateProfileData());
				dataConnection.on('data', function(profile_data) {
				  if (debug){console.log('Received:'+ JSON.stringify(profile_data));}
				  for (new_peer_id of profile_data.peers_list){
					  if (!window.peers_list.includes(new_peer_id)){
						  window.peers_list.push(new_peer_id);
					  }
				  }
				  
				  showMosaicProfile(profile_data);
				});
			});
		}
	}
	sessionStorage.removeItem("peers");
}

/****************** TODO **********************/

function tchat(){
	var target_id = document.getElementById("peer_id").innerHTML;
	document.getElementById("tchat_functions").style.display = "block";
	if (target_id){
		var peer = window.peer;
		const dataConnection = peer.connect(target_id);
		dataConnection.on('open', function(connection) {
			console.log("tchat connection opened");
			//send and receive messages
			//make "send" button available
			conn = connection;
			conn.on('data', function (data) {
				console.log('Received', data);
				dataObject = JSON.parse(data);
				if (dataObject["message"]){
					printMsg("They: " + dataObject)
				}
			});
		});
	}
}

function sendMessage() {
	var msg = document.getElementById("tchat_box").innerHTML;
	console.log("sending message")
	// send message at sender or receiver side
	if (conn && conn.open) {
		printMsg("Me : " + msg);
		conn.send(JSON.stringify({message: msg}));
	}
}

function printMsg(msg) {
	var messages = document.getElementById("tchat_content");
	messages.innerHTML = messages.innerHTML + "<li>" + msg + "</li>";
}