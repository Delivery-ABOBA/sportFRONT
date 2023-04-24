var profile_image_input = document.getElementById("upload-profile-photo");
profile_image_input.addEventListener("change", update_profile_img);

var message_input = document.getElementById("message_input_id");
var chat_online_indicator = document.getElementById("chat_online_indicator");
var scrollable_messages = document.getElementById('scrollable_messages');

var main_messages_block = document.getElementById("main_messages_place");
var empty_holder = document.getElementById('empty_holder_id');
var chat_content_holder = document.getElementById("messages_holder_id");
var messages_holder = document.getElementById("messages_content_placeholder_id");
var chats_holder = document.getElementById("chats_list_placeholder");
var users_holder = document.getElementById("users_list_placeholder");
var invite_panel = document.getElementById("offcanvas-add-members");
var invite_button = document.getElementById("invite_button");
var current_chat_name = document.getElementById("current_chat_name");
var current_chat_status = document.getElementById("current_chat_status");
// var current_chat_profile_href = document.getElementById("current_chat_profile_href");

var current_chat_profile_img = document.getElementById("current_chat_profile_img");
var current_chat_profile_name = document.getElementById("current_chat_profile_name");
var current_chat_profile_bio = document.getElementById("current_chat_profile_bio");
var current_chat_profile_desc_text = document.getElementById("current_chat_profile_desc_text");
var current_chat_profile_delete = document.getElementById("current_chat_profile_delete");
var chat_attachments_button = document.getElementById("chat_attachments_button");
var chat_files_button = document.getElementById("chat_files_button");
var chat_attachments_placeholder = document.getElementById("chat_attachments_placeholder");
var chat_files_placeholder = document.getElementById("chat_files_placeholder");
var invite_users_placeholder = document.getElementById("invite_users_place");
var only_profile_info = document.getElementById("only_profile_info");
var only_group_info = document.getElementById("only_group_info");
var invite_members = document.getElementById("invite_members");

var user_profile_image = document.getElementById("user-profile-image");
var user_profile_name = document.getElementById("user-profile-name");
var user_profile_about = document.getElementById("user-profile-about");
var user_profile_online = document.getElementById("user-profile-online");
var user_profile_email = document.getElementById("user-profile-email");

var files_input_field = document.getElementById("file-to-upload");
var files_preview = document.getElementById("dz-preview-row");
files_input_field.addEventListener('change', upload_attachment);
var uploaded_files = [];
var users_to_invite = [];

var priv_key = "", my_pubkey = "", target_pubkey = "", max_id = -1, min_id = -1, current_id = null, is_group = null;
var prev_date = "", prev_time = "";
var my_data = {}, target_name = null;
var ws = null, prev_sender = null, prev_id = null, is_typing = false;
var time_difference = new Date().getTimezoneOffset() * -1;

var chats_loader = document.getElementById("chats_loader");
var users_loader = document.getElementById("users_loader");
var profile_loader = document.getElementById("profile_loader");
var invite_loader = document.getElementById("invite_loader");
var members_loader = document.getElementById("members_loader");
var tracks_loader = document.getElementById("tracks_loader");

var search_users_input = document.getElementById('search_input_id')
var search_user_to_invite = document.getElementById('search_user_to_invite') // todo

var bb_parser = new BBCodeParser();
var typingTimer;
var doneTypingInterval = 2500;

var playlist = null;
var myPlaylist = null;

var profile_perma_img = document.getElementById("profile_perma_img");
var profile_perma_symbol = document.getElementById("profile_perma_symbol");
var profile_settings_img = document.getElementById("profile_settings_img");
var profile_img = document.getElementById("profile_img");

var player_placeholder = document.getElementById("player_placeholder");
var tracks_placeholder = document.getElementById("tracks_placeholder");
var search_tracks_id = document.getElementById("search_tracks_id");

var send_msg_button = document.getElementById("send-msg-button");

// let myDropzone = new Dropzone("div#main_content_container", { url: "/file/post"});


history.pushState(null, null, location.href);
window.onpopstate = function (){
    history.go(1);
    // TODO load required data
};

function connect(){ // todo test
    var socket_protocol = "wss";
    ws = new WebSocket(`${socket_protocol}://${socket_host}/ws/?token=` + getCookie("token"));
    ws.onmessage = function(event) {
        received_data = JSON.parse(event.data)
        console.log(received_data);
        if (received_data.res.sender == my_data.login){
            console.log("skip local event");
            return;
        }
        if (received_data.action == "send"){
            if (received_data.res.current_name == target.name  && received_data.res.group == is_group){
                third_param = "target";
                if (is_group == true) third_param = received_data.sender_data.id;
                message_constructor(received_data.res, received_data.sender_data, third_param);
            }
            else{
                console.log("skip message");
            }
        }
        else if (received_data.action == "delete"){
            if (received_data.res.current_name == target.name  && received_data.res.group == is_group){
                var message_block = document.getElementById("message_" + received_data.res.id);
                if (message_block.parentNode.childNodes.length == 1){
                    var parent = message_block.closest(".message");
                    parent.parentNode.removeChild(parent);
                }
                else{
                    message_block.parentNode.removeChild(message_block);
                }
            }
            else{
                console.log("skip message");
            }
        }
        else if (received_data.action == "edit"){
            if (received_data.res.current_name == target.name  && received_data.res.group == is_group){
                // todo text edit
            }
            else{
                console.log("skip message edit");
            }
        }
        else if (received_data.action == "typing_start"){
            add_typing_text(received_data.res.sender);
        }
        else if (received_data.action == "typing_stop"){
            remove_typing_text(received_data.res.sender);
        }
    };
}

function websocket_trigger(ws_data){ ws.send(ws_data); }

function add_typing_text(login){
    //var element = {id: username + "_typing", date: previous_date, time: "now", service: true, edited: false, attachment: null, writer: username};
    //add_message(my_data, typing_anim, true, element, null, true);
    console.log(login + " start typing");  // todo remove
}

function remove_typing_text(login){
    //document.getElementById("typing_" + username + "_indicator").remove();
    console.log(login + " stop typing"); // todo remove
}

function typing_timer(){
    clearTimeout(typingTimer);
    typingTimer = setTimeout(finish_typing, doneTypingInterval);
}

function reset_typing_timer(){
    if (is_typing == false){
        is_typing = true;
        websocket_trigger(JSON.stringify({action: "typing_start", res: {current_name: target_name, group: is_group, sender: my_data.login}}));
    }
    clearTimeout(typingTimer);
}

function finish_typing(){
    is_typing = false;
    websocket_trigger(JSON.stringify({action: "typing_stop", res: {current_name: target_name, group: is_group, sender: my_data.login}}));
}

function encrypt_message_forward(message){ return cryptico.encrypt(message, my_pubkey).cipher; }

function encrypt_message(message, group){
    if (group == false) return cryptico.encrypt(message, target_pubkey).cipher;
    else return cryptico.encryptAESCBC(message, target_pubkey);
}

function decrypt_message(message, group){
    if (group == false) return cryptico.decrypt(message, priv_key).plaintext;
    else return cryptico.decryptAESCBC(message, target_pubkey);
}

function update_profile_img(private=true){
    var url = "/user/profile/private";
    if (private == false) url = "/user/profile/" + private;
    print(profile_image_input.files[0]);
    var formData = new FormData();
    formData.append("data", profile_image_input.files[0]);
    $.ajax({url: server_host + url,
        type: 'POST',
        headers: {'authorization': 'Bearer ' + getCookie("token")},
        data: formData,
        async: false, cache: false, contentType: false, processData: false,
        success: function (data){ profile(); }
    });
}

function enable_main_placeholder(local_data, id, img, enable=true){
    prev_date = "";
    messages_holder.textContent = "";
    if (enable == true){
        message_input.style.overflow = "hidden";
        empty_holder.className = "hidden-element";
        main_messages_block.className = "main is-visible";
        chat_content_holder.className = "d-flex flex-column h-100 position-relative";
        chat_online_indicator.className = "avatar d-none d-xl-inline-block"
        if (typeof local_data === "string") current_chat_name.textContent = local_data;
        else{
            if (local_data.username != null) current_chat_name.textContent = local_data.username;
            else current_chat_name.textContent = local_data.login;
            if (local_data.status == true) chat_online_indicator.className = "avatar avatar-online d-none d-xl-inline-block";
        }
        if (is_default_image(img) == true){
            var avatar_image = document.createElement("span");
            avatar_image.className = "avatar-text";
            if (typeof local_data === "string") avatar_image.textContent = local_data[0];
            else{
                if (local_data.username != null) avatar_image.textContent = local_data.username[0];
                else avatar_image.textContent = local_data.login[0];
            }
        }
        else{
            var avatar_image = document.createElement("img");
            avatar_image.className = "avatar-img";
            avatar_image.src = transform_image(img);
        }
        chat_online_indicator.textContent = "";
        chat_online_indicator.appendChild(avatar_image);
    }
    else{
        chat_content_holder.className = "hidden-element";
        main_messages_block.className = "main";
        empty_holder.className = "d-flex flex-column h-100 justify-content-center text-center";
    }
}

function create_chat(){
    var group_name = document.getElementById('group_name_id').value;
    if (group_name.length < 5) {show_notification("Group name must be more then 5 symbols"); return;}
    var local_files = document.getElementById('upload-chat-img').files;
    if (local_files.length == 0) local_files = null;
    else local_files = local_files[0];
    var group_description = document.getElementById('group_description_id').value;
    print(local_files);
    print(group_name);
    data={image: local_files, name: group_name, key: encrypt_message_forward(generate_aes(32)), description: group_description}
    var xhr = CustomXHR("POST", "/group/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status != 200) forbidden_handler();
    }
    xhr.send(JSON.stringify(data));
}

function setup_key(user_id, user_login){
    var xhr = CustomXHR("GET", "/user/profile/" + user_login + "/?only_key=true");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var data = {user_id: user_id}
            var local_key = generate_aes(32);
            data.key = encrypt_message_forward(local_key);
            print(xhr.responseText);
            data.user_key = invite_encrypt(local_key, xhr.responseText);
            target_pubkey = cryptico.string2bytes(local_key);
            data.message_text = encrypt_message(toUnicode(my_data.login + " started dialog"), true);
            var xhr2 = CustomXHR("POST", "/chat/key/");
            xhr2.onreadystatechange = function(){
                if(xhr2.readyState === 4 && xhr2.status === 200){
                    if (xhr2.responseText != "true"){
                        show_notification("Something went wrong");
                    }
                }
                else if (xhr2.readyState === 4 && xhr2.status === 403) forbidden_handler();
            }
            xhr2.send(JSON.stringify(data));
        }
        else if (xhr.readyState === 4 && xhr.status === 500){
            show_notification("User not found");
        }
    }
    xhr.send();
    return target_pubkey;
}

function upload_attachment(){
    files = files_input_field.files;
    if (files_preview.childNodes.length == 0){
        files_preview.className = "dz-preview bg-dark dz-preview-moved pb-10 pt-3 px-2";
    }
    var reader = new FileReader();
    files.forEach((file) => {
        var preview_div = document.createElement("div");
        preview_div.id = "attachment_" + file.name + "_" + file.lastModified;
        preview_div.className = "theme-file-preview position-relative mx-2";
        var preview_icon = document.createElement("div");
        preview_icon.className = "avatar avatar-lg";
        if(file.type.includes("image")){
            reader.onloadend = function() {
                var preview_local_img = document.createElement("img");
                preview_local_img.src = reader.result;
                preview_local_img.className = "avatar-img rounded file-title";
                preview_local_img.alt = file.name;
                preview_local_img.title = file.name;
                preview_icon.appendChild(preview_local_img);
            }
            reader.readAsDataURL(file);
        }
        else{
            var preview_span = document.createElement("span");
            preview_span.className = "avatar-text rounded bg-secondary text-body file-title";
            preview_span.title = file.name;
            preview_span.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';
            preview_icon.appendChild(preview_span);
        }
        preview_div.appendChild(preview_icon);
        var preview_href = document.createElement("a");
        preview_href.href = "#";
        preview_href.setAttribute("onclick", "remove_attachment('" + file.name + "', " + file.lastModified + ");");
        preview_href.className = "badge badge-circle bg-body text-white position-absolute top-0 end-0 m-2";
        preview_href.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" class="css-i6dzq1"><line x1="18" y1="2" x2="6" y2="16"></line><line x1="6" y1="2" x2="18" y2="16"></line></svg>';
        preview_div.appendChild(preview_href);
        files_preview.appendChild(preview_div);

        if (file.type.includes("image")) type = "image";
        else if (file.type.includes("document")) type = "doc";
        else if (file.type.includes("zip")) type = "archive";
        else type = "other";

        var formData = new FormData();
        formData.append("file_data", file);
        $.ajax({url: server_host + '/attachments/' + file.name + "/?file_type=" + type,
            type: 'POST',
            headers: {'authorization': 'Bearer ' + getCookie("token")},
            data: formData,
            async: false, cache: false, contentType: false, processData: false,
            success: function (data) {
                if (data.res == "File is too big"){
                    show_notification("File is too big");
                    return;
                }
                else{
                    uploaded_files.push({url: encrypt_message(data.res, true), name: file.name, type: type, height: file.height, width: file.width, size: file.size});
                    print(uploaded_files);
                }
            }
        });
    });
}

function remove_attachment(name, lastMod){
    var file = document.getElementById("attachment_" + name + "_" + lastMod);
    file.parentNode.removeChild(file);
    if (files_preview.childNodes.length == 0){
        files_preview.className = "dz-preview bg-dark";
    }
    for (var i = 0; i < uploaded_files.length; i++) {
        if (uploaded_files[i].name == name){
            uploaded_files.splice(i, 1);
            break;
        }
    }
    print(uploaded_files);
    // todo later (remove from server)
}

function show_attachments(name, type, offset=0){
    show_loader(profile_loader);
    var xhr = CustomXHR("GET", "/attachments/" + name + "/?chat_type=" + type + "&offset=" + offset);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var response_json = JSON.parse(xhr.responseText).res;
            if (offset == 0){
                chat_attachments_placeholder.textContent = "";
            }
            try{
                var msg = document.getElementById("load_more_attachments_button");
                msg.parentNode.removeChild(msg);
            }
            catch(e){ if (e instanceof TypeError) {} }
            var images = [];
            for (var i = 0; i < response_json.length; i++) {
                if (response_json[i].type == "image"){
                    images.push(response_json[i]);
                }
            }
            for (var i = 0; i < images.length; i++) {
                var attachment = images[i];
                attachment.url = transform_image(decrypt_message(attachment.url, true));
                var local_item_div = document.createElement("div");
                local_item_div.className = "col";
                    var local_item_a = document.createElement("a");
                    local_item_a.href = "#";
                    local_item_a.setAttribute("data-bs-toggle", "modal");
                    local_item_a.setAttribute("data-bs-target", "#modal-media-preview");
                    local_item_a.setAttribute("data-theme-img-url", attachment.url);
                        var local_item_img = document.createElement("img");
                        local_item_img.className = "img-fluid rounded";
                        local_item_img.src = attachment.url;
                        local_item_a.appendChild(local_item_img);
                    local_item_div.appendChild(local_item_a);
                chat_attachments_placeholder.appendChild(local_item_div);
            }
            var load_more = document.createElement("div");
            load_more.className = "load-more-data";
            load_more.id = "load_more_attachments_button";
            var load_more_href = document.createElement("a");
            load_more_href.textContent = "Load more";
            load_more_href.setAttribute("onclick", 'show_attachments("' + name + '", "' + type + '", ' + parseInt(offset + 100) + ');');
            load_more.appendChild(load_more_href);
            chat_attachments_placeholder.appendChild(load_more);
            show_loader(profile_loader, false);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function show_docs(name, type, offset = 0) {
    show_loader(profile_loader);
    var xhr = CustomXHR("GET", "/attachments/" + name + "/?chat_type=" + type + "&media_type=doc&offset=" + offset);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response_json = JSON.parse(xhr.responseText).res;
            if (offset == 0) {
                chat_files_placeholder.textContent = "";
            }
            try {
                var msg = document.getElementById("load_more_docs_button");
                msg.parentNode.removeChild(msg);
            } catch (e) {
                if (e instanceof TypeError) {}
            }
            for (var i = 0; i < response_json.length; i++) {
                var attachment = response_json[i];
                attachment.url = transform_image(decrypt_message(attachment.url, true));
                var local_parent = document.createElement("li");
                local_parent.className = "list-group-item";
                var local_row = document.createElement("div");
                local_row.className = "row align-items-center gx-5";
                var local_img = document.createElement("div");
                local_img.className = "col-auto";
                var local_img_href = document.createElement("a");
                local_img_href.href = attachment.url;
                local_img_href.className = "avatar avatar-sm";
                var local_img_span = document.createElement("span");
                local_img_span.className = "avatar-text bg-primary";
                if (attachment.type == "doc") {
                    local_img_span.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
                } else if (attachment.type != "image") {
                    local_img_span.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-file"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>';
                }
                local_img_href.appendChild(local_img_span);
                local_img.appendChild(local_img_href);
                local_row.appendChild(local_img);
                var local_info = document.createElement("div");
                local_info.className = "col overflow-hidden";
                var local_header = document.createElement("h5")
                local_header.className = "text-truncate";
                var file_href = document.createElement("a");
                file_href.href = attachment.url;
                file_href.textContent = attachment.name;
                local_header.appendChild(file_href);
                local_info.appendChild(local_header);
                var local_info_content = document.createElement("ul");
                local_info_content.className = "list-inline m-0";
                var local_li_1 = document.createElement("li");
                local_li_1.className = "list-inline-item";
                var local_small_1 = document.createElement("small");
                local_small_1.className = "text-uppercase text-muted";
                if (attachment.size != null) local_small_1.textContent = attachment.size;
                else local_small_1.textContent = "0 B";
                local_li_1.appendChild(local_small_1);
                local_info_content.appendChild(local_li_1);
                var local_li_2 = document.createElement("li");
                local_li_2.className = "list-inline-item";
                var local_small_2 = document.createElement("small");
                local_small_2.className = "text-uppercase text-muted";
                local_small_2.textContent = attachment.name.split(".").pop();
                local_li_2.appendChild(local_small_2);
                local_info_content.appendChild(local_li_2);
                local_info.appendChild(local_info_content);
                local_row.appendChild(local_info);
                var local_actions = document.createElement("div");
                local_actions.className = "col-auto";
                var local_dropdown = document.createElement("div");
                local_dropdown.className = "dropdown";
                var local_dropdown_collapse_button = document.createElement("a");
                local_dropdown_collapse_button.className = "icon text-muted";
                local_dropdown_collapse_button.href = "#";
                local_dropdown_collapse_button.setAttribute("role", "button");
                local_dropdown_collapse_button.setAttribute("data-bs-toggle", "dropdown");
                local_dropdown_collapse_button.setAttribute("aria-expanded", "false");
                local_dropdown_collapse_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
                local_dropdown.appendChild(local_dropdown_collapse_button);
                var local_dropdown_content = document.createElement("ul");
                local_dropdown_content.className = "dropdown-menu";
                var local_item_1 = document.createElement("li");
                var local_item_1_a = document.createElement("a");
                local_item_1_a.className = "dropdown-item d-flex align-items-center";
                local_item_1_a.href = "#";
                local_item_1_a.setAttribute("onclick", ""); // todo
                var local_item_1_span = document.createElement("span");
                local_item_1_span.className = "me-auto";
                local_item_1_span.textContent = "Download";
                local_item_1_a.appendChild(local_item_1_span);
                var local_item_1_icon = document.createElement("div");
                local_item_1_icon.className = "icon";
                local_item_1_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
                local_item_1_a.appendChild(local_item_1_icon);
                local_item_1.appendChild(local_item_1_a);
                local_dropdown_content.appendChild(local_item_1);
                var local_item_2 = document.createElement("li");
                var local_item_2_a = document.createElement("a");
                local_item_2_a.className = "dropdown-item d-flex align-items-center";
                local_item_2_a.href = "#";
                local_item_2_a.setAttribute("onclick", ""); // todo
                var local_item_2_span = document.createElement("span");
                local_item_2_span.className = "me-auto";
                local_item_2_span.textContent = "Share";
                local_item_2_a.appendChild(local_item_2_span);
                var local_item_2_icon = document.createElement("div");
                local_item_2_icon.className = "icon";
                local_item_2_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>';
                local_item_2_a.appendChild(local_item_2_icon);
                local_item_2.appendChild(local_item_2_a);
                local_dropdown_content.appendChild(local_item_2);
                local_dropdown.appendChild(local_dropdown_content);
                local_actions.appendChild(local_dropdown);
                local_row.appendChild(local_actions);
                local_parent.appendChild(local_row);
                chat_files_placeholder.appendChild(local_parent);
            }
            var load_more = document.createElement("div");
            load_more.className = "load-more-data";
            load_more.id = "load_more_docs_button";
            var load_more_href = document.createElement("a");
            load_more_href.textContent = "Load more";
            load_more_href.setAttribute("onclick", 'show_attachments("' + name + '", "' + type + '", ' + parseInt(offset + 100) + ');');
            load_more.appendChild(load_more_href);
            chat_files_placeholder.appendChild(load_more);
            show_loader(profile_loader, false);
        } else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function delete_chat(name, type){ // todo
    print("not working yet");
}

function edit_message(){ // todo
    print("not working yet");
}

function reply_message(){ // todo
    print("not working yet");
}

function open_profile(username){
    var xhr = CustomXHR("GET", "/user/profile/" + username + "/");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            var response_json = JSON.parse(xhr.responseText).res;
            if (is_default_image(response_json.image_url) == true){
                var local_img = document.createElement("span");
                local_img.className = "avatar-text";
                if (response_json.username != null) response_json.textContent = my_data.username[0];
                else response_json.textContent = response_json.login[0];
            }
            else{
                var local_img = document.createElement("img");
                local_img.className = "avatar-img";
                local_img.src = transform_image(response_json.image_url);
            }
            user_profile_image.appendChild(local_img);
            user_profile_name.textContent = response_json.login;
            if (response_json.username != null) user_profile_name.textContent += " (" + response_json.username + ")";
            if (response_json.description != null) user_profile_about.textContent = response_json.description;
            if (response_json.status == true) user_profile_online.textContent = "Online";
            else user_profile_status.textContent = "Offline";
            if (response_json.email != null) user_profile_email.textContent = response_json.email;
            // todo hide empty fields
        }
        if (xhr.readyState === 4 && xhr.status === 404){
            not_found_handler();
        }
    }
    xhr.send();
}

function message_constructor(element, user_data, curr_sender) {
    if (element.service != true) {
        var date = new Date(convertToDate(element.date + "T" + element.time).getTime() + time_difference * 60000);
        date = strftime('%d-%m-%YT%H:%M:%S', date);
        date = date.split("T");
        element.date = date[0];
        element.time = date[1];
    }
    // start merging block
    var local_merge = false;
    if (prev_sender != null) {
        if (prev_sender == curr_sender) local_merge = true;
        if (element.time.split(":")[0] != prev_time) local_merge = false;
    }
    prev_time = element.time.split(":")[0];
    // start date check block
    if (prev_date != element.date) {
        prev_date = element.date;
        var message_divider = document.createElement("div");
        message_divider.className = "message-divider";
        var date_span = document.createElement("small");
        date_span.className = "text-muted";
        date_span.textContent = element.date;
        message_divider.appendChild(date_span);
        messages_holder.appendChild(message_divider);
        local_merge = false;
    }
    if (element.service == true) {
        var service_message = document.createElement("div");
        service_message.className = "message-divider";
        var service_text = document.createElement("small");
        service_text.className = "text-muted";
        service_text.textContent = toUnicode(decrypt_message(element.message, true), true);
        service_message.appendChild(service_text);
        messages_holder.appendChild(service_message);
        return;
    }
    // start main message block
    if (local_merge == false) {
        var local_message_block = document.createElement("div");
        if (curr_sender == "me") local_message_block.className = "message message-out";
        else local_message_block.className = "message";
        var local_member_block = document.createElement("a");
        local_member_block.className = "avatar avatar-responsive";
        local_member_block.href = "#";
        local_member_block.setAttribute("data-bs-toggle", "modal");
        if (element.sender == "me") {
            local_member_block.setAttribute("data-bs-target", "#modal-profile");
            if (is_default_image(my_data.image_url) == true) {
                var member_img = document.createElement("img");
                member_img.className = "avatar-text";
                if (my_data.username != null) member_img.textContent = my_data.username[0];
                else member_img.textContent = my_data.login[0];
            } else {
                var member_img = document.createElement("img");
                member_img.className = "avatar-img";
                member_img.src = transform_image(my_data.image_url);
            }
        } else {
            local_member_block.setAttribute("data-bs-target", "#modal-user-profile");
            local_member_block.setAttribute("onclick", 'open_profile("' + user_data.login + '");');
            if (is_default_image(user_data.image_url) == true) {
                var member_img = document.createElement("span");
                member_img.className = "avatar-text";
                if (my_data.username != null) member_img.textContent = user_data.username[0];
                else member_img.textContent = user_data.login[0];
            } else {
                var member_img = document.createElement("img");
                member_img.className = "avatar-img";
                member_img.src = transform_image(user_data.image_url);
            }
        }
        local_member_block.appendChild(member_img);
        local_message_block.appendChild(local_member_block);
        var local_message_content = document.createElement("div");
        local_message_content.className = "message-inner";
        var local_message_body = document.createElement("div");
        local_message_body.className = "message-body";
    }
    var local_message_w_actions = document.createElement("div");
    local_message_w_actions.className = "message-content";
    local_message_w_actions.id = "message_" + element.id;
    var local_message_text_block = document.createElement("div");
    local_message_text_block.className = "message-text";
    // todo reply block here
    var local_message_text = document.createElement("p");
    local_message_text.innerHTML = toUnicode(decrypt_message(element.message, true), true);
    local_message_text_block.appendChild(local_message_text);
    local_message_w_actions.appendChild(local_message_text_block);
    var local_actions = document.createElement("div");
    local_actions.className = "message-action";
    var local_dropdown = document.createElement("div");
    local_dropdown.className = "dropdown";
    var local_dropdown_collapse_button = document.createElement("a");
    local_dropdown_collapse_button.className = "icon text-muted";
    local_dropdown_collapse_button.href = "#";
    local_dropdown_collapse_button.setAttribute("role", "button");
    local_dropdown_collapse_button.setAttribute("data-bs-toggle", "dropdown");
    local_dropdown_collapse_button.setAttribute("aria-expanded", "false");
    local_dropdown_collapse_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
    local_dropdown.appendChild(local_dropdown_collapse_button);
    var local_dropdown_content = document.createElement("ul");
    local_dropdown_content.className = "dropdown-menu";
    var local_item_1 = document.createElement("li");
    var local_item_1_a = document.createElement("a");
    local_item_1_a.className = "dropdown-item d-flex align-items-center";
    local_item_1_a.href = "#";
    local_item_1_a.setAttribute("onclick", "edit_message(" + element.id + ")");
    var local_item_1_span = document.createElement("span");
    local_item_1_span.className = "me-auto";
    local_item_1_span.textContent = "Edit";
    local_item_1_a.appendChild(local_item_1_span);
    var local_item_1_icon = document.createElement("div");
    local_item_1_icon.className = "icon";
    local_item_1_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>';
    local_item_1_a.appendChild(local_item_1_icon);
    local_item_1.appendChild(local_item_1_a);
    local_dropdown_content.appendChild(local_item_1);
    var local_item_2 = document.createElement("li");
    var local_item_2_a = document.createElement("a");
    local_item_2_a.className = "dropdown-item d-flex align-items-center";
    local_item_2_a.href = "#";
    local_item_2_a.setAttribute("onclick", "reply_message(" + element.id + ")");
    var local_item_2_span = document.createElement("span");
    local_item_2_span.className = "me-auto";
    local_item_2_span.textContent = "Reply";
    local_item_2_a.appendChild(local_item_2_span);
    var local_item_2_icon = document.createElement("div");
    local_item_2_icon.className = "icon";
    local_item_2_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-up-left"><polyline points="9 14 4 9 9 4"></polyline><path d="M20 20v-7a4 4 0 0 0-4-4H4"></path></svg>';
    local_item_2_a.appendChild(local_item_2_icon);
    local_item_2.appendChild(local_item_2_a);
    local_dropdown_content.appendChild(local_item_2);
    var local_item_3 = document.createElement("li");
    var local_line = document.createElement("hr");
    local_line.className = "dropdown-divider";
    local_item_3.appendChild(local_line);
    local_dropdown_content.appendChild(local_item_3);
    var local_item_4 = document.createElement("li");
    var local_item_4_a = document.createElement("a");
    local_item_4_a.className = "dropdown-item d-flex align-items-center text-danger";
    local_item_4_a.href = "#";
    local_item_4_a.setAttribute("onclick", "delete_message(" + element.id + ")");
    var local_item_4_span = document.createElement("span");
    local_item_4_span.className = "me-auto";
    local_item_4_span.textContent = "Delete";
    local_item_4_a.appendChild(local_item_4_span);
    var local_item_4_icon = document.createElement("div");
    local_item_4_icon.className = "icon";
    local_item_4_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
    local_item_4_a.appendChild(local_item_4_icon);
    local_item_4.appendChild(local_item_4_a);
    local_dropdown_content.appendChild(local_item_4);
    local_dropdown.appendChild(local_dropdown_content);
    local_actions.appendChild(local_dropdown);
    local_message_w_actions.appendChild(local_actions);
    if (local_merge == false) {
        local_message_body.appendChild(local_message_w_actions);
        local_message_content.appendChild(local_message_body);
        var local_message_footer = document.createElement("div");
        local_message_footer.className = "message-footer";
        var local_time_span = document.createElement("span");
        local_time_span.className = "extra-small text-muted";
        local_time_span.textContent = element.time;
        local_message_footer.appendChild(local_time_span);
        local_message_content.appendChild(local_message_footer);
        local_message_block.appendChild(local_message_content);
    }
    // start message attachments block
    if (element.attachment != null) {
        var local_images = [], local_files = [];
        for (var i = 0; i < element.attachment.length; i++) {
            if (element.attachment[i].type == "image") local_images.push(element.attachment[i]);
            else local_files.push(element.attachment[i]);
        }
        if (local_images.length > 0) {
            var local_gallery_block = document.createElement("div");
            local_gallery_block.className = "message-gallery";
            var local_gallery_row = document.createElement("div");
            local_gallery_row.className = "row gx-3";
            local_images.forEach((image) => { // todo more then 3 elements
                var local_image_block = document.createElement("div");
                local_image_block.className = "col";
                var local_image_src = document.createElement("img");
                local_image_src.className = "img-fluid rounded";
                local_image_src.setAttribute("data-action", "zoom");
                local_image_src.src = transform_image(decrypt_message(image.url, true));
                local_image_block.appendChild(local_image_src);
                local_gallery_row.appendChild(local_image_block);
            });
            local_gallery_block.appendChild(local_gallery_row);
            local_message_text_block.appendChild(local_gallery_block);
        }
        if (local_files.length > 0) {
            var local_files_block = document.createElement("div");
            local_files.forEach((file) => {
                var _file_link = transform_image(decrypt_message(file.url, true));
                local_files_block.className = "row align-items-center gx-4";
                var local_files_col_auto = document.createElement("div");
                local_files_col_auto.className = "col-auto";
                var local_download = document.createElement("a")
                local_download.className = "avatar avatar-sm";
                local_download.href = _file_link;
                var local_download_img = document.createElement("div")
                local_download_img.className = "avatar-text bg-white text-primary";
                local_download_img.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-arrow-down"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>';
                local_download.appendChild(local_download_img);
                local_files_col_auto.appendChild(local_download);
                local_files_block.appendChild(local_files_col_auto);
                var local_files_overflow = document.createElement("div");
                local_files_overflow.className = "col overflow-hidden";
                var local_file_name = document.createElement("h6");
                local_file_name.className = "text-truncate text-reset";
                var local_file_href = document.createElement("a");
                local_file_href.className = "text-reset";
                local_file_href.textContent = file.name;
                local_file_href.href = _file_link;
                local_file_name.appendChild(local_file_href);
                local_files_overflow.appendChild(local_file_name);
                var local_file_size = document.createElement("ul");
                local_file_size.className = "list-inline text-uppercase extra-small opacity-75 mb-0";
                var local_file_size_text = document.createElement("li");
                local_file_size_text.className = "list-inline-item";
                if (file.size != null) local_file_size_text.textContent = file.size;
                else local_file_size_text.textContent = "0 B";
                local_file_size.appendChild(local_file_size_text);
                local_files_overflow.appendChild(local_file_size);
                local_files_block.appendChild(local_files_overflow)
                local_message_text_block.appendChild(local_files_block);
            });
        }
    }
    if (local_merge == false) messages_holder.appendChild(local_message_block);
    else document.getElementById("message_" + prev_id).parentNode.appendChild(local_message_w_actions);
    if (local_merge == true) {
        var parent_inner = document.getElementById("message_" + prev_id).parentNode.parentNode;
        parent_inner.querySelector(".extra-small").textContent = element.time;
    }
}

function load_early_messages(chat, type){ // todo

}

function show_load_early_button(chat, type){
    var load_more = document.createElement("div");
    load_more.className = "load-more-data";
    load_more.id = "load_more_messages_button";
    var load_more_href = document.createElement("a");
    load_more_href.textContent = "Load more";
    load_more_href.setAttribute("onclick", 'load_early_messages("' + chat + '", "' + type + '");');
    load_more.appendChild(load_more_href);
    messages_holder.insertBefore(load_more, messages_holder.firstChild);
}

function fill_profile(login, id, img, group=false, username=null){
    current_chat_profile_name.textContent = login;
    chat_attachments_placeholder.textContent = "";
    chat_files_placeholder.textContent = "";
    if (group == true){
        only_profile_info.style = "display: none;";
        only_group_info.style = "";
        invite_button.className = "col-auto";
        chat_attachments_button.setAttribute("onclick", 'show_attachments("' + login + '", "group")')
        chat_files_button.setAttribute("onclick", 'show_docs("' + login + '", "group")')
        current_chat_profile_delete.setAttribute("onclick", 'delete_chat("' + login + '","group");');
        group_info(login)
    }
    else{
        only_group_info.style = "display: none;";
        only_profile_info.style = "";
        invite_button.className = "hidden-element";
        chat_attachments_button.setAttribute("onclick", 'show_attachments("' + login + '", "private")')
        chat_files_button.setAttribute("onclick", 'show_docs("' + login + '", "private")')
        // todo get profile data from server
        // current_chat_profile_desc_text
        // if (data.username != null) current_chat_profile_bio.textContent = data.username;
        current_chat_profile_delete.setAttribute("onclick", 'delete_chat("' + login + '","private");');
    }
    if (is_default_image(img) == true){
        var avatar_image = document.createElement("div");
        avatar_image.className = "avatar avatar-xl mx-auto";
        var local_prnt = document.createElement("span");
        local_prnt.className = "avatar-text";
        if (username == null) local_prnt.textContent = login[0];
        else local_prnt.textContent = username[0];
        avatar_image.appendChild(local_prnt);
    }
    else{
        var avatar_image = document.createElement("img");
        avatar_image.className = "avatar-img";
        avatar_image.src = transform_image(img);
    }
    current_chat_profile_img.textContent = "";
    current_chat_profile_img.appendChild(avatar_image);
}

function open_dialog(login, id, img){
    prev_sender = null, prev_id = null, current_id = id, is_group = false, target_name = login, uploaded_files = [], users_to_invite = [];
    var xhr = CustomXHR("GET", "/chat/" + login + "/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var response_json = JSON.parse(xhr.responseText);
            enable_main_placeholder(response_json.target, id, img);
            if (response_json.target.status == true) current_chat_status.textContent = "Online";
            else current_chat_status.textContent = "Offline";
            if (response_json.need_key){
                target_pubkey = setup_key(id, login);
            }
            else{
                target_pubkey = cryptico.string2bytes(decrypt_message(response_json.key, false));
            }
            my_data = response_json.me;
            show_load_early_button(login, "private");
            response_json.res.forEach((element) => {
                message_constructor(element, response_json.target, element.sender);
                prev_id = element.id;
                prev_sender = element.sender;
            });
    		scroll(scrollable_messages);
            max_id = response_json.max_id;
            min_id = response_json.min_id;
            fill_profile(login, id, img, is_group, response_json.target.username);

        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function open_group(login, id, img){
    prev_sender = null, prev_id = null, current_id = id, is_group = true, target_name = login, uploaded_files = [], users_to_invite = [];
    var xhr = CustomXHR("GET", "/group/" + id + "/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var response_json = JSON.parse(xhr.responseText);
            enable_main_placeholder(login, id, img);
            current_chat_status.textContent = response_json.members_count + " members";
            target_pubkey = cryptico.string2bytes(decrypt_message(response_json.key, false));
            my_data = response_json.me;
            show_load_early_button(id, "group");
            response_json.res.forEach((element) => {
                message_constructor(element, element.sender_data, element.sender_data.id);
                prev_id = element.id;
                prev_sender = element.sender_data.id;
            });
    		scroll(scrollable_messages);
            max_id = response_json.max_id;
            min_id = response_json.min_id;
            fill_profile(login, id, img, is_group);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function users_list_constructor(element){
    // todo sort by alphabetic order
	var chat_element = document.createElement("div");
	chat_element.className = "card border-0";
	var card_body = document.createElement("div");
	card_body.className = "card-body";
	var card_row = document.createElement("div");
	card_row.className = "row align-items-center gx-5";
	var avatar_div = document.createElement("div");
	avatar_div.className = "col-auto";
	var avatar = document.createElement("a");
	if (element.status == true) avatar.className = "avatar avatar-online";
    else avatar.className = "avatar";
    avatar.href = "#";
    avatar.setAttribute("data-bs-toggle", "modal");
    avatar.setAttribute("data-bs-target", "#modal-user-profile");
    avatar.setAttribute("onclick", 'open_profile("' + element.login + '");');
    if (is_default_image(element.image_url) == true){
        var avatar_image = document.createElement("span");
        avatar_image.className = "avatar-text";
        if (element.username != null) avatar_image.textContent = element.username[0];
        else avatar_image.textContent = element.login[0];
    }
    else{
        var avatar_image = document.createElement("img");
        avatar_image.src = transform_image(element.image_url);
        avatar_image.className = "avatar-img";
    }
    avatar.appendChild(avatar_image);
    avatar_div.appendChild(avatar);
	var content_div = document.createElement("div");
	content_div.className = "col";
    var content_header = document.createElement("h5");
    var profile_link = document.createElement("a");
    profile_link.href = "#";
    profile_link.setAttribute("data-bs-toggle", "modal");
    profile_link.setAttribute("data-bs-target", "#modal-user-profile");
    profile_link.setAttribute("onclick", 'open_profile("' + element.login + '");');
    if (element.username != null) profile_link.textContent = element.username;
    else profile_link.textContent = element.login;
    content_header.appendChild(profile_link);
    var content_body = document.createElement("p")
    if (element.status == true) content_body.textContent = "online";
    else if (element.status == false && element.show_online == false) content_body.textContent = "offline";
    else if (element.status == false && element.last_online != null) content_body.textContent = calculate_last_online(element.last_online);
    else content_body.textContent = "offline";
    content_div.appendChild(content_header);
    content_div.appendChild(content_body);
	var settings_div = document.createElement("div");
	settings_div.className = "col-auto";
    var drop_div = document.createElement("div");
    drop_div.className = "dropdown";
    drop_div.id = "drop_ul_" + element.id;
    var drop_a = document.createElement("a");
    drop_a.className = "icon text-muted";
    drop_a.href = "#";
    drop_a.setAttribute("role", "button");
    drop_a.setAttribute("data-bs-toggle", "dropdown");
    drop_a.setAttribute("aria-expanded", "false");
    drop_a.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
    var drop_ul = document.createElement("ul");
    drop_ul.className = "dropdown-menu";
    var drop_li_1 = document.createElement("li");
    var new_msg = document.createElement("a");
    new_msg.className = "dropdown-item";
    new_msg.setAttribute("onclick", 'open_dialog("' + element.login + '",' + element.id + ',"' + element.image_url + '");');
    new_msg.textContent = "New message";
    drop_li_1.appendChild(new_msg);
    var drop_li_2 = document.createElement("li");
    var edit_contact = document.createElement("a");
    edit_contact.className = "dropdown-item";
    edit_contact.href = "#"; // todo add function
    edit_contact.textContent = "Edit contact";
    drop_li_2.appendChild(edit_contact);
    var drop_li_3 = document.createElement("li");
    var divider = document.createElement("hr");
    divider.className = "dropdown-divider";
    drop_li_3.appendChild(divider);
    var drop_li_4 = document.createElement("li");
    var block_user = document.createElement("a");
    block_user.className = "dropdown-item text-danger";
    block_user.href = "#"; // todo add function
    block_user.textContent = "Block user";
    drop_li_4.appendChild(block_user);
    drop_ul.appendChild(drop_li_1);
    drop_ul.appendChild(drop_li_2);
    drop_ul.appendChild(drop_li_3);
    drop_ul.appendChild(drop_li_4);
    drop_div.appendChild(drop_a);
    drop_div.appendChild(drop_ul);
    settings_div.appendChild(drop_div);
	card_row.appendChild(avatar_div);
	card_row.appendChild(content_div);
	card_row.appendChild(settings_div);
	card_body.appendChild(card_row);
    chat_element.appendChild(card_body);
	return chat_element
}

function add_to_invite_list(login){
    users_to_invite.push(login);
}

function invite_list_constructor(element){
    // todo sort by alphabetic order
	var user_element = document.createElement("li");
	user_element.className = "list-group-item";
	var card_row = document.createElement("div");
	card_row.className = "row align-items-center gx-5";
	var avatar_div = document.createElement("div");
	avatar_div.className = "col-auto";
	var avatar = document.createElement("a");
	if (element.status == true) avatar.className = "avatar avatar-online";
    else avatar.className = "avatar";
    avatar.href = "#";
    avatar.setAttribute("data-bs-toggle", "modal");
    avatar.setAttribute("data-bs-target", "#modal-user-profile");
    avatar.setAttribute("onclick", 'open_profile("' + element.login + '");');
    if (is_default_image(element.image_url) == true){
        var avatar_image = document.createElement("span");
        avatar_image.className = "avatar-text";
        if (element.username != null) avatar_image.textContent = element.username[0];
        else avatar_image.textContent = element.login[0];
    }
    else{
        var avatar_image = document.createElement("img");
        avatar_image.src = transform_image(element.image_url);
        avatar_image.className = "avatar-img";
    }
    avatar.appendChild(avatar_image);
    avatar_div.appendChild(avatar);
	var content_div = document.createElement("div");
	content_div.className = "col";
    var content_header = document.createElement("h5");
    var profile_link = document.createElement("a");
    profile_link.href = "#";
    profile_link.setAttribute("data-bs-toggle", "modal");
    profile_link.setAttribute("data-bs-target", "#modal-user-profile");
    profile_link.setAttribute("onclick", 'open_profile("' + element.login + '");');
    if (element.username != null) profile_link.textContent = element.username;
    else profile_link.textContent = element.login;
    content_header.appendChild(profile_link);
    content_div.appendChild(content_header);
    if (element.description != null){
        var content_body = document.createElement("p")
        content_body.textContent = element.description;
        content_div.appendChild(content_body);
    }
    card_row.appendChild(avatar_div);
	card_row.appendChild(content_div);
	if (element.id != my_data.id){
        var settings_div = document.createElement("div");
        settings_div.className = "col-auto";
        var invite_checkbox = document.createElement("div");
        invite_checkbox.className = "form-check";
        var checkbox = document.createElement("input");
        checkbox.className = "form-check-input";
        checkbox.setAttribute("type", "checkbox");
        checkbox.setAttribute("onclick", 'add_to_invite_list("' + element.login + '")');
        invite_checkbox.appendChild(checkbox);
        settings_div.appendChild(invite_checkbox);
        card_row.appendChild(settings_div);
    }
    user_element.appendChild(card_row);
	return user_element
}

function group_members_constructor(element, owner_id){
    var local_parent = document.createElement("li");
    local_parent.id = "member_list_" + element.id;
    local_parent.className = "list-group-item";
    var local_child_div = document.createElement("div");
    local_child_div.className = "row align-items-center gx-5";
    var first_col = document.createElement("div");
    first_col.className = "col-auto";
    var avatar_div = document.createElement("div");
    avatar_div.className = "avatar";
    if (element.status == true) avatar_div.className += " avatar-online";
    if (is_default_image(element.image_url) == true){
        var avatar_img = document.createElement("span");
        avatar_img.className = "avatar-text";
        if (element.username != null) avatar_img.textContent = element.username[0];
        else avatar_img.textContent = element.login[0];
    }
    else{
        var avatar_img = document.createElement("img");
        avatar_img.className = "avatar-img";
        avatar_img.src = transform_image(element.image_url);
    }
    avatar_div.appendChild(avatar_img);
    first_col.appendChild(avatar_div);
    local_child_div.appendChild(first_col);
    var second_col = document.createElement("div");
    second_col.className = "col";
    var local_header = document.createElement("h5");
    var local_profile_href = document.createElement("a");
    local_profile_href.href = "#";
    if (element.username != null) local_profile_href.textContent = element.username;
    else local_profile_href.textContent = element.login;
    local_profile_href.setAttribute("data-bs-toggle", "modal");
    local_profile_href.setAttribute("data-bs-target", "#modal-user-profile");
    local_profile_href.setAttribute("onclick", 'open_profile("' + element.login + '");')
    local_header.appendChild(local_profile_href);
    second_col.appendChild(local_header);
    var local_status = document.createElement("p");
    if (element.online == true) local_status.textContent = "online";
    else local_status.textContent = "offline"; // todo last online
    second_col.appendChild(local_status);
    local_child_div.appendChild(second_col);
    if (element.id == owner_id){
        var admin_badge = document.createElement("div");
        admin_badge.className = "col-auto";
        var badge_text = document.createElement("span");
        badge_text.className = "extra-small text-primary";
        badge_text.textContent = "owner";
        admin_badge.appendChild(badge_text);
        local_child_div.appendChild(admin_badge);
    }
    if (my_data.id == owner_id && element.id != my_data.id){
        var actions_div = document.createElement("div");
        actions_div.className = "col-auto";
        var local_dropdown = document.createElement("div");
        local_dropdown.className = "dropdown";
        var local_dropdown_collapse_button = document.createElement("a");
        local_dropdown_collapse_button.className = "icon text-muted";
        local_dropdown_collapse_button.href = "#";
        local_dropdown_collapse_button.setAttribute("role", "button");
        local_dropdown_collapse_button.setAttribute("data-bs-toggle", "dropdown");
        local_dropdown_collapse_button.setAttribute("aria-expanded", "false");
        local_dropdown_collapse_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
        local_dropdown.appendChild(local_dropdown_collapse_button);
        var local_dropdown_content = document.createElement("ul");
        local_dropdown_content.className = "dropdown-menu";
        var kick_button = document.createElement("li");
        var kick_href = document.createElement("a");
        kick_href.className = "dropdown-item d-flex align-items-center text-danger";
        kick_href.href = "#";
        kick_href.setAttribute("onclick", 'kick_user(' + current_id + ',' + element.id + ',"' + element.login + '");')
        kick_href.textContent = "Delete";
        var trash_icon = document.createElement("div");
        trash_icon.className = "icon ms-auto";
        trash_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>';
        kick_href.appendChild(trash_icon);
        kick_button.appendChild(kick_href);
        local_dropdown_content.appendChild(kick_button);
        local_dropdown.appendChild(local_dropdown_content);
        actions_div.appendChild(local_dropdown);
        local_child_div.appendChild(actions_div);
    }
    local_parent.appendChild(local_child_div);
    return local_parent
}

function chats_list_constructor(element){
    // todo sort by time
    var chat_element = document.createElement("a");
	chat_element.className = "card border-0 text-reset";
	chat_element.href = "#";
	if (element.group == false){
	    chat_element.setAttribute("onclick", 'open_dialog("' + element.login + '",' + element.id + ',"' + element.image_url + '");');
	}
	else{
	    chat_element.setAttribute("onclick", 'open_group("' + element.login + '",' + element.id + ',"' + element.image_url + '");');
	}
	var card_body = document.createElement("div")
	card_body.className = "card-body";
	var card_row = document.createElement("div");
	card_row.className = "row gx-5";
	var auto_avatar = document.createElement("div");
	auto_avatar.className = "col-auto";
    var avatar = document.createElement("div");
    if (element.status == true) avatar.className = "avatar avatar-online";
    else avatar.className = "avatar";
    auto_avatar.appendChild(avatar);
    if (is_default_image(element.image_url) == true){
        var avatar_image = document.createElement("span");
        avatar_image.className = "avatar-text";
        if (element.username != null) avatar_image.textContent = element.username[0];
        else avatar_image.textContent = element.login[0];
    }
    else{
        var avatar_image = document.createElement("img");
        avatar_image.src = transform_image(element.image_url);
        avatar_image.className = "avatar-img";
    }
    avatar.appendChild(avatar_image);
    var col_data = document.createElement("div");
    col_data.className = "col";
    var data_header = document.createElement("div");
    data_header.className = "d-flex align-items-center mb-3";
    var username = document.createElement("h5");
    username.className = "me-auto mb-0";
    if (element.username != null) username.textContent = element.username;
    else username.textContent = element.login;
    var time_msg = document.createElement("span");
    time_msg.className = "text-muted extra-small ms-2";
    time_msg.textContent = "2:28"; // todo last msg time
    data_header.appendChild(username);
    data_header.appendChild(time_msg);
    var data_content = document.createElement("div");
    data_content.className = "d-flex align-items-center";
    var last = document.createElement("div");
    last.className = "line-clamp me-auto";
    last.textContent = "not displayed yet"; // todo last msg content
    var new_count = document.createElement("div");
    new_count.id = "chat_count_" + element.id;
    new_count.className = "badge badge-circle bg-primary ms-5";
    var count = document.createElement("span");
    count.textContent = 0; // todo new msgs count
    new_count.appendChild(count);
    data_content.appendChild(last);
    data_content.appendChild(new_count);
    col_data.appendChild(data_header);
    col_data.appendChild(data_content);
    card_row.appendChild(auto_avatar);
    card_row.appendChild(col_data);
    card_body.appendChild(card_row);
	chat_element.appendChild(card_body);
	return chat_element
}

function chats(){
    show_loader(chats_loader);
    var xhr = CustomXHR("GET", "/chat/all/");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            chats_holder.textContent = "";
            JSON.parse(xhr.responseText).res.forEach((element) => {
                chats_holder.appendChild(chats_list_constructor(element));
            });
            show_loader(chats_loader, false);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function users(){
    show_loader(users_loader);
    var xhr = CustomXHR("GET", "/user/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            users_holder.textContent = "";
            JSON.parse(xhr.responseText).res.forEach((element) => {
                users_holder.appendChild(users_list_constructor(element));
            });
            show_loader(users_loader, false);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function search_users(){
    var value = search_users_input.value;
    if (value.length < 2){
        return;
    }
    show_loader(users_loader);
    var xhr = CustomXHR("GET", "/user/?name=" + value);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            users_holder.textContent = "";
            JSON.parse(xhr.responseText).res.forEach((element) => {
                users_holder.appendChild(users_list_constructor(element));
            });
            show_loader(users_loader, false);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function profile(only_img=false){ // todo test
    priv_key = cryptico.generateRSAKey(localStorage.getItem("pass_phrase"), 1024);
    my_pubkey = cryptico.publicKeyString(priv_key);
    var xhr = CustomXHR("GET", "/user/me/");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            my_data = JSON.parse(xhr.responseText).res;
            if (is_default_image(my_data.image_url) == true){
                if (my_data.username != null) var local_symbol = my_data.username[0];
                else var local_symbol = my_data.login[0];
                profile_perma_img.className = "hidden-element";
                profile_settings_img.className = "hidden-element";
                profile_img.className = "hidden-element";
                profile_perma_symbol.className = "avatar-text";
                profile_settings_symbol.className = "avatar-text";
                profile_symbol.className = "avatar-text";
                profile_perma_symbol.textContent = local_symbol;
                profile_settings_symbol.textContent = local_symbol;
                profile_symbol.textContent = local_symbol;
            }
            else{
                profile_perma_symbol.className = "hidden-element";
                profile_settings_symbol.className = "hidden-element";
                profile_symbol.className = "hidden-element";
                profile_perma_img.className = "avatar-img";
                profile_settings_img.className = "avatar-img";
                profile_img.className = "avatar-img";
                profile_perma_img.src = transform_image(my_data.image_url);
                profile_settings_img.src = transform_image(my_data.image_url);
                profile_img.src = transform_image(my_data.image_url);
            }
            if (only_img == true) return;
            var profile_settings_name = document.getElementById("profile_settings_name");
            var profile_settings_email = document.getElementById("profile_settings_email");
            var profile_name = document.getElementById("profile_name");
            var profile_email = document.getElementById("profile_email");
            var profile_username_editable = document.getElementById("profile-username");
            var profile_email_editable = document.getElementById("profile-email");
            var profile_about_editable = document.getElementById("profile-about");

            document.getElementById("personal_profile_actions").className = "";
            profile_settings_name.textContent = my_data.login;
            profile_name.textContent = my_data.login;
            if (my_data.username != null) {
                profile_settings_name.textContent += " (" + my_data.username + ")";
                profile_name.textContent += " (" + my_data.username + ")";
                profile_username_editable.value = my_data.username;
            }
            if (my_data.badges != null){
                profile_name.textContent += " ";
                my_data.badges.split(",").forEach((element) => {
                    var badge = document.createElement("span");
                    badge.className = "badge bg-primary";
                    badge.textContent = my_data.badges;
                    profile_name.appendChild(badge);
                });
            }
            if (my_data.email != null) {
                profile_settings_email.textContent = my_data.email;
                profile_email.textContent = my_data.email;
                profile_email_editable.value = my_data.email;
            }
            else {
                profile_settings_email = "email not set";
                profile_email.textContent = "email not set";
            }
            if (my_data.description != null) {
                document.getElementById("profile_description").textContent = my_data.description;
                profile_about_editable.value = my_data.description;
            }
            document.getElementById("profile_online").textContent = "Online";
        }
        if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
    connect();
}

function save_account_info(){ // todo
    var data = {};
    var username = document.getElementById("name_entry").value;
    var email = document.getElementById("email_entry").value;
    var about = document.getElementById("about_entry").value;
    if (email.length > 0){
        data.email = email;
    }
    data.username = username;
    data.about = about;
    var xhr = CustomXHR("PATCH", "/user/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){}
    }
    xhr.send(JSON.stringify(data));
}

function change_account_password(){ // todo

}

function connected_accounts(){ // todo
    print("not working yet");
}

function send_message(){
    if (message_input.value == ""){
        show_notification("Empty message body");
        return;
    }
    var data = {target: current_id, group: is_group, attachment: uploaded_files};
    var text = toUnicode(message_input.value);
    data.message_text = encrypt_message(text, true);

    var xhr = CustomXHR("POST", "/message/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            max_id = JSON.parse(xhr.responseText).res;
            var lcl_dt = JSON.parse(xhr.responseText).time.split(" ");
            var element = {id: max_id, date: prev_date, service: false, edited: false, read: false, message: data.message_text, attachment: uploaded_files};
            element.date = lcl_dt[0];
            element.time = lcl_dt[1];
            third_param = "me";
            if (is_group == true) third_param = my_data.id;
            message_constructor(element, my_data, third_param);
            uploaded_files = [];
            files_preview.textContent = "";
            files_preview.className = "dz-preview bg-dark";
            message_input.value = "";
            data.current_name = target_name;
            data.sender = my_data.login;
            data.time = "now";
            data.date = prev_date;
            data.edited = false;
            data.read = false;
            data.service = false;
            data.id = max_id;
            // websocket_trigger(JSON.stringify({action: "send", res: data}));  // todo
    		scroll(scrollable_messages);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send(JSON.stringify(data));
}

function delete_message(message_id){ // todo
    var message_block = document.getElementById("message_" + message_id);
    print(message_block.parentNode.childNodes.length);
    if (message_block.parentNode.childNodes.length == 1){
        var parent = message_block.closest(".message");
        parent.parentNode.removeChild(parent);
    }
    else{
        message_block.parentNode.removeChild(message_block);
    }
    var data = {message_id: message_id, group: is_group};
    var xhr = CustomXHR("DELETE", "/message/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            data = {current_name: target_name, delete_id: message_id, group: is_group};
            // websocket_trigger(JSON.stringify({action: "delete", res: data}));
        }
    }
    xhr.send(JSON.stringify(data));
}

function fill_invite_list(){
    show_loader(invite_loader);
    var xhr = CustomXHR("GET", "/user/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            invite_users_placeholder.textContent = "";
            JSON.parse(xhr.responseText).res.forEach((element) => {
                invite_users_placeholder.appendChild(invite_list_constructor(element));
            });
            show_loader(invite_loader, false);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function invite_selected(){ // todo test
    users_to_invite.forEach((element) => {
        var data = {group_id: current_id, user_login: element};
        var xhr = CustomXHR("GET", "/user/profile/" + element + "/?only_key=true");
        xhr.onreadystatechange = function(){
            if(xhr.readyState === 4 && xhr.status === 200){
                data.key = invite_encrypt(cryptico.bytes2string(target_pubkey), xhr.responseText);
                data.message_text = encrypt_message(toUnicode(my_data.login + " invited " + element), true);
                var xhr2 = CustomXHR("PATCH", "/group/");
                xhr2.onreadystatechange = function(){
                    if(xhr2.readyState === 4 && xhr2.status === 200){
                        var response_json = JSON.parse(xhr2.responseText).res;
                        if (response_json == "false" || response_json == false){
                            show_notification("User already in chat");
                        }
                        else{
                            var element = {id: response_json, date: prev_date, service: true, edited: false, attachment: null, message: data.message_text};
                            third_param = "me";
                            if (is_group == true) third_param = my_data.id;
                            message_constructor(element, my_data, third_param);
                            scroll(scrollable_messages);
                        }
                    }
                    else if (xhr2.readyState === 4 && xhr2.status === 403) forbidden_handler();
                    users_to_invite = [];
                }
                xhr2.send(JSON.stringify(data));
            }
            else if (xhr.readyState === 4 && xhr.status === 500){ // todo
                show_notification("User not found");
            }
        }
        xhr.send();
    });
}

function kick_user(group_id, user_id, target_name){ // todo
    var data = {group_id: group_id, user_id: user_id};
    data.message_text = encrypt_message(toUnicode(my_data.login + " kicked " + target_name), true);
    var xhr = CustomXHR("DELETE", "/group/");
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            // var block = document.getElementById("user_profile" + user_id);
            // block.parentNode.removeChild(block);
            var response_json = JSON.parse(xhr.responseText).res;
            if (response_json == "false" || response_json == false){
                show_notification("User not in chat", false);
            }
            else{
                max_id = response_json;
                var element = {id: max_id, date: previous_date, service: true, edited: false, attachment: null, message: data.message_text};
                add_message(my_data, my_data.login + " kicked " + target_name, true, element);
                third_param = "me";
                if (is_group == true) third_param = my_data.id;
                message_constructor(element, my_data, third_param);
            }
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send(JSON.stringify(data));
}

function group_info(group){
    show_loader(members_loader);
    var xhr = CustomXHR("GET", "/group/info/" + group + "/");
    only_group_info.textContent = "";
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4 && xhr.status === 200){
            var response_json = JSON.parse(xhr.responseText).res;
            show_loader(members_loader, false);
            response_json.users.forEach((element) => {
                only_group_info.appendChild(group_members_constructor(element, response_json.owner_id));
            });
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
    }
    xhr.send();
}

function build_settings_menu(data){ // todo

}

function settings(){
    var xhr = CustomXHR("GET", "/user/me/?config=true");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            build_settings_menu(JSON.parse(xhr.responseText).res);
        }
    }
    xhr.send();
}

//media block start
function player_constructor(own) {
    var player = document.createElement("div");
    player.className = "music-player";
    var player_info = document.createElement("div");
    player_info.className = "info";
    var player_left = document.createElement("div");
    player_left.className = "left";
    var player_shuffle = document.createElement("a");
    player_shuffle.className = "icon-shuffle";
    player_shuffle.href = "#";
    player_shuffle.innerHTML = '<svg id="icon-shuffle" xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>';
    player_left.appendChild(player_shuffle);
    var player_heart = document.createElement("a");
    player_heart.className = "icon-heart jp-repeat";
    player_heart.href = "#";
    var temp_color = inactive_color;
    if (own == true) temp_color = active_color;
    player_heart.innerHTML = '<svg id="icon-heart" xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + temp_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
    player_left.appendChild(player_heart);
    player_info.appendChild(player_left);
    var player_center = document.createElement("div");
    player_center.className = "center";
    var player_playlist = document.createElement("div");
    player_playlist.className = "jp-playlist";
    var player_playlist_div = document.createElement("div");
    var player_playlist_li = document.createElement("ul");
    player_playlist_div.appendChild(player_playlist_li);
    player_playlist.appendChild(player_playlist_div);
    player_center.appendChild(player_playlist);
    player_info.appendChild(player_center);
    var player_right = document.createElement("div");
    player_right.className = "right";
    var player_repeat = document.createElement("a");
    player_repeat.className = "icon-repeat";
    player_repeat.href = "#";
    player_repeat.innerHTML = '<svg id="icon-repeat" xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + active_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>';
    player_right.appendChild(player_repeat);
    var player_share = document.createElement("a");
    player_share.className = "icon-share";
    player_share.href = "#";
    player_share.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>';
    player_right.appendChild(player_share);
    player_info.appendChild(player_right);
    var player_progress = document.createElement("div");
    player_progress.className = "progress";
    player_info.appendChild(player_progress);
    player.appendChild(player_info);
    var player_controls = document.createElement("div");
    player_controls.className = "controls";
    var player_time = document.createElement("div");
    player_time.className = "current jp-current-time";
    player_time.textContent = "00:00";
    player_controls.appendChild(player_time);
    var player_play = document.createElement("div");
    player_play.className = "play-controls";
    var player_prev = document.createElement("a");
    player_prev.className = "jp-previous";
    player_prev.href = "#";
    player_prev.title = "previous";
    player_prev.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>';
    player_play.appendChild(player_prev);
    var player_play_play = document.createElement("a");
    player_play_play.className = "jp-play";
    player_play_play.href = "#";
    player_play_play.title = "play";
    player_play_play.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    player_play.appendChild(player_play_play);
    var player_pause = document.createElement("a");
    player_pause.className = "jp-pause";
    player_pause.href = "#";
    player_pause.title = "pause";
    player_pause.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    player_play.appendChild(player_pause);
    var player_next = document.createElement("a");
    player_next.className = "jp-next";
    player_next.href = "#";
    player_next.title = "next";
    player_next.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>';
    player_play.appendChild(player_next);
    player_controls.appendChild(player_play);
    var player_volume = document.createElement("div");
    player_volume.className = "volume-level";
    var player_volume_up = document.createElement("a");
    player_volume_up.className = "icon-player-volume-up";
    player_volume_up.href = "javascript:;";
    player_volume_up.title = "max volume";
    player_volume_up.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
    player_volume.appendChild(player_volume_up);
    var player_volume_down = document.createElement("a");
    player_volume_down.className = "icon-player-volume-down";
    player_volume_down.href = "javascript:;";
    player_volume_down.title = "mute";
    player_volume_down.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="player-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + inactive_color + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>';
    player_volume.appendChild(player_volume_down);
    player_controls.appendChild(player_volume);
    player.appendChild(player_controls);
    var jquery_player = document.createElement("div");
    jquery_player.id = "jquery_jplayer";
    jquery_player.className = "jp-jplayer";
    player.appendChild(jquery_player);
    return player;
}

function track_block_constructor(track, own=false){
    var single_item = document.createElement("div");
    single_item.className = "single-item";

    var img_play_a = document.createElement("a");
    var track_index = playlist.indexOf(track);
    img_play_a.id = "track_" + track_index;
    img_play_a.className = "single-item__cover";
    img_play_a.setAttribute("data-img", "source/images/music.svg");
    img_play_a.setAttribute("onclick", "play_selected_track(" + track_index + ");");
    var track_poster = document.createElement("img");
    if (track.poster != null) track_poster.src = track.poster_low;
    else track_poster.src = "source/images/music.svg";
    img_play_a.appendChild(track_poster);
    img_play_a.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.54,9,8.88,3.46a3.42,3.42,0,0,0-5.13,3V17.58A3.42,3.42,0,0,0,7.17,21a3.43,3.43,0,0,0,1.71-.46L18.54,15a3.42,3.42,0,0,0,0-5.92Zm-1,4.19L7.88,18.81a1.44,1.44,0,0,1-1.42,0,1.42,1.42,0,0,1-.71-1.23V6.42a1.42,1.42,0,0,1,.71-1.23A1.51,1.51,0,0,1,7.17,5a1.54,1.54,0,0,1,.71.19l9.66,5.58a1.42,1.42,0,0,1,0,2.46Z"></path></svg>';
    img_play_a.innerHTML += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16,2a3,3,0,0,0-3,3V19a3,3,0,0,0,6,0V5A3,3,0,0,0,16,2Zm1,17a1,1,0,0,1-2,0V5a1,1,0,0,1,2,0ZM8,2A3,3,0,0,0,5,5V19a3,3,0,0,0,6,0V5A3,3,0,0,0,8,2ZM9,19a1,1,0,0,1-2,0V5A1,1,0,0,1,9,5Z"></path></svg>';

    var item_title = document.createElement("div");
    item_title.className = "single-item__title";
    var title_header = document.createElement("h4");
    title_header.textContent = track.artist;
    var title_name = document.createElement("span");
    if (track.title.length > 20) title_name.textContent = track.title.substring(0, 19) + "...";
    else title_name.textContent = track.title;
    item_title.appendChild(title_header);
    item_title.appendChild(title_name);

    single_item.appendChild(img_play_a);
    single_item.appendChild(item_title);
    var track_length = document.createElement("span");
    track_length.className = "single-item__time";
    if (track.duration != null) track_length.textContent = track.duration;
    else track_length.textContent = "2:28";
    single_item.appendChild(track_length);
    if (own == false){
        var add_to_favs = document.createElement("a");
        add_to_favs.className = "single-item__add";
        add_to_favs.href = "javascript:add_track_to_favorites(" + track_index + ");";
        add_to_favs.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,11H13V5a1,1,0,0,0-2,0v6H5a1,1,0,0,0,0,2h6v6a1,1,0,0,0,2,0V13h6a1,1,0,0,0,0-2Z"></path></svg>';
        single_item.appendChild(add_to_favs);
    } else {
        var track_actions = document.createElement("a");
        track_actions.className = "single-item__export";
        var local_dropdown = document.createElement("div");
        local_dropdown.className = "dropdown";
        var local_dropdown_collapse_button = document.createElement("a");
        local_dropdown_collapse_button.className = "icon text-muted";
        local_dropdown_collapse_button.href = "#";
        local_dropdown_collapse_button.setAttribute("role", "button");
        local_dropdown_collapse_button.setAttribute("data-bs-toggle", "dropdown");
        local_dropdown_collapse_button.setAttribute("aria-expanded", "false");
        local_dropdown_collapse_button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>';
        local_dropdown.appendChild(local_dropdown_collapse_button);
        var local_dropdown_content = document.createElement("ul");
        local_dropdown_content.className = "dropdown-menu";
        var local_item_1 = document.createElement("li");
        var local_item_1_a = document.createElement("a");
        local_item_1_a.className = "dropdown-item d-flex align-items-center";
        local_item_1_a.href = "#";
        local_item_1_a.setAttribute("onclick", "cache_action(" + track_index + ");");
        var local_item_1_span = document.createElement("span");
        local_item_1_span.className = "me-auto";
        local_item_1_span.textContent = "Save";
        local_item_1_a.appendChild(local_item_1_span);
        var local_item_1_icon = document.createElement("div");
        local_item_1_icon.className = "icon";
        local_item_1_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21,14a1,1,0,0,0-1,1v4a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V15a1,1,0,0,0-2,0v4a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V15A1,1,0,0,0,21,14Zm-9.71,1.71a1,1,0,0,0,.33.21.94.94,0,0,0,.76,0,1,1,0,0,0,.33-.21l4-4a1,1,0,0,0-1.42-1.42L13,12.59V3a1,1,0,0,0-2,0v9.59l-2.29-2.3a1,1,0,1,0-1.42,1.42Z"></path></svg>';
        local_item_1_a.appendChild(local_item_1_icon);
        local_item_1.appendChild(local_item_1_a);
        local_dropdown_content.appendChild(local_item_1);
        var local_item_2 = document.createElement("li");
        var local_item_2_a = document.createElement("a");
        local_item_2_a.className = "dropdown-item d-flex align-items-center";
        local_item_2_a.href = "#";
        local_item_2_a.setAttribute("onclick", "remove_track_from_favorites(" + track.id + ");");
        var local_item_2_span = document.createElement("span");
        local_item_2_span.className = "me-auto";
        local_item_2_span.textContent = "Remove";
        local_item_2_a.appendChild(local_item_2_span);
        var local_item_2_icon = document.createElement("div");
        local_item_2_icon.className = "icon";
        local_item_2_icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.71,8.29a1,1,0,0,0-1.42,0L12,10.59,9.71,8.29A1,1,0,0,0,8.29,9.71L10.59,12l-2.3,2.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l2.29,2.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L13.41,12l2.3-2.29A1,1,0,0,0,15.71,8.29Zm3.36-3.36A10,10,0,1,0,4.93,19.07,10,10,0,1,0,19.07,4.93ZM17.66,17.66A8,8,0,1,1,20,12,7.95,7.95,0,0,1,17.66,17.66Z"></path></svg>';
        local_item_2_a.appendChild(local_item_2_icon);
        local_item_2.appendChild(local_item_2_a);
        local_dropdown_content.appendChild(local_item_2);
        local_dropdown.appendChild(local_dropdown_content);
        track_actions.appendChild(local_dropdown);
        single_item.appendChild(track_actions);
    }
    return single_item;
}

function play_selected_track(track_id){
    var track_block = document.getElementById('track_' + track_id);
    if (track_block.className == "single-item__cover"){
        myPlaylist.play(track_id);
        var track_blocks = document.querySelectorAll(".single-item__cover");
        for (var i = 0; i < track_blocks.length; i++) {
            track_blocks[i].className = "single-item__cover";
        }
        track_block.className = "single-item__cover active pause";
    }
    else if (track_block.className == "single-item__cover active pause"){
        myPlaylist.play();
        track_block.className = "single-item__cover active play";
    }
    else if (track_block.className == "single-item__cover active play"){
        myPlaylist.pause();
        track_block.className = "single-item__cover active pause"
    }
}

function search_tracks(){
    var search_value = search_tracks_id.value;
    if (search_value.length < 4){
        return;
    }
	show_loader(tracks_loader);
    var xhr = MediaXHR("GET", "/media/v2/" + search_value + "/");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            tracks_placeholder.textContent = "";
            var results_div = document.createElement("div");
            results_div.className = "single-item";
	        var search_div = document.createElement("div");
            search_div.style = "font-weight: bold;";
            search_div.textContent = "Results for: " + search_value;
            results_div.appendChild(search_div);
            tracks_placeholder.appendChild(results_div);
            playlist = JSON.parse(xhr.responseText);
            print(playlist);
            player_placeholder.textContent = "";
            player_placeholder.appendChild(player_constructor());
            playlist.forEach((element) => {
                tracks_placeholder.appendChild(track_block_constructor(element));
            });
            player_start(playlist);
            show_loader(tracks_loader, false);
        }
    }
    xhr.send();
}

function highlight_track(track_id){
    var track_blocks = document.querySelectorAll(".single-item__cover");
    for (var i = 0; i < track_blocks.length; i++) {
        track_blocks[i].className = "single-item__cover";
    }
    document.getElementById('track_' + track_id).className = "single-item__cover active play";
}

function add_track_to_favorites(index){
    var xhr = MediaXHR("POST", "/media/favorite");
    var data = {artist: playlist[index].artist, mp3: playlist[index].mp3, title: playlist[index].title,
                duration: playlist[index].duration, poster: playlist[index].poster, poster_low: playlist[index].poster_low};
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            show_notification('ok');
        }
    }
    xhr.send(JSON.stringify(data));
}

function remove_track_from_favorites(index){
    var xhr = MediaXHR("DELETE", "/media/favorite/" + index);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            show_notification('ok');
        }
    }
    xhr.send();
}

function cache_track(url){
    debug({"msg": "cache_track"});
    print("caching " + url);
    var cache = document.createElement("audio");
    cache.setAttribute("id", "cache_" + url);
    cache.setAttribute("muted", "");
    cache.src = url;
    cache.setAttribute("onended", "remove_cache_player('" + url + "');");
    document.body.appendChild(cache);
    cache.volume = 0;
    cache.playbackRate = 15;
    cache.play();
}

function remove_cache_player(url){
    var block = document.getElementById("cache_" + url);
    block.parentNode.removeChild(block);
    print("removed");
    debug({"msg": "cache_track finish"});
}

function cache_action(track_id){
    if (track_id == playlist.length - 1) track_id = 0;
    else track_id = track_id + 1;
    cache_track(playlist[track_id].mp3);
}

function preload_track(track_id){  // todo test
    if (track_id == playlist.length - 1) track_id = 0;
    else track_id = track_id + 1;
    cache_track(playlist[track_id].mp3);
}

function player_start(playlist){
    var songDuration = -1;
    var cssSelector={
        jPlayer: "#jquery_jplayer",
        cssSelectorAncestor: ".music-player"
    };
    var options={
        swfPath: "/source/lib/jquery.jplayer.swf",
        supplied: "ogv, m4v, oga, mp3",
        loop: true,
        volumechange: function(event){
            $(".volume-level").slider("value", event.jPlayer.options.volume);
        },
        timeupdate: function(event){
            $(".progress").slider("value", event.jPlayer.status.currentPercentAbsolute);
            if (event.jPlayer.status.currentPercentAbsolute > 75 && can_preload == true){
                can_preload = false;
                preload_track(myPlaylist.current);
            }
        },
        ended: function(event){
            can_preload = true;
            highlight_track(myPlaylist.current);
        },
        pause: function(event){
            document.getElementById('track_' + myPlaylist.current).className = "single-item__cover active pause";
        },
        play: function(event){
            document.getElementById('track_' + myPlaylist.current).className = "single-item__cover active play";
        },
        loadeddata: function(event){
            if ('mediaSession' in navigator){
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: event.jPlayer.status.media.title,
                    artist: event.jPlayer.status.media.artist,
                    album: '',
                    artwork: [
                        { src: event.jPlayer.status.media.poster_low,   sizes: '60x60',   type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster_low,   sizes: '96x96',   type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster_low,   sizes: '120x120',   type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster_low, sizes: '128x128', type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster, sizes: '192x192', type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster, sizes: '256x256', type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster, sizes: '384x384', type: 'image/jpeg' },
                        { src: event.jPlayer.status.media.poster, sizes: '512x512', type: 'image/jpeg' }
                    ]
                });
                navigator.mediaSession.setActionHandler('play', () => { myPlaylist.play(); });
                navigator.mediaSession.setActionHandler('pause', () => { myPlaylist.pause(); });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    if (myPlaylist.current == 0) play_selected_track(playlist.length - 1);
                    else play_selected_track(myPlaylist.current - 1);
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    if (myPlaylist.current == playlist.length - 1) play_selected_track(0);
                    else play_selected_track(myPlaylist.current + 1);
                });
            }
            songDuration = event.jPlayer.status.duration;
        }
    };
    myPlaylist = new jPlayerPlaylist(cssSelector, playlist, options);
    var PlayerData = $(cssSelector.jPlayer).data("jPlayer");

    // Create next button
    $(".jp-next").click(function(){
        highlight_track(myPlaylist.current);
    });
    // Create previous button
    $(".jp-previous").click(function(){
        highlight_track(myPlaylist.current);
    });

    // Create shuffle button
    $(".icon-shuffle").click(function(){
        myPlaylist.shuffle();
        player_color("icon-shuffle");
        // todo rebuild playlist items
    });
    // Create loop button
    //$(".icon-repeat").click(function(){
        //player_color("icon-repeat");
    //});
    // Create share button
    $(".icon-share").click(function(){
        console.log(myPlaylist.current);
        console.log("share");
    });
    // Create favorite button
    $(".icon-heart").click(function(){
        if (document.getElementById("icon-heart").getAttribute("stroke") == inactive_color)
            add_track_to_favorites(myPlaylist.current);
        else
            remove_track_from_favorites(playlist[myPlaylist.current].id);
        player_color("icon-heart");
    });
    // Create the volume slider control
    $(".volume-level").slider({
        animate: "fast",
		max: 1,
		range: "min",
		step: 0.01,
		value : $.jPlayer.prototype.options.volume,
		slide: function(event, ui){
			$(cssSelector.jPlayer).jPlayer("option", "muted", false);
			$(cssSelector.jPlayer).jPlayer("option", "volume", ui.value);
		}
    });
    // Create the progress slider control
    $(".progress").slider({
		animate: "fast",
		max: 100,
		range: "min",
		step: 0.1,
		value : 0,
		slide: function(event, ui){
			$(cssSelector.jPlayer).jPlayer("play", ui.value * (songDuration / 100));
		}
	});
}

function audio(hard=false){
    if (tracks_placeholder.textContent != "" && hard == false){
        print("not hard reload");  // todo
        return;
    }
    show_loader(tracks_loader);
    var xhr = MediaXHR("GET", "/media/playlist");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            playlist = JSON.parse(xhr.responseText);
            print(playlist);
            player_placeholder.textContent = "";
            player_placeholder.appendChild(player_constructor());
            playlist.forEach((element) =>{
                tracks_placeholder.appendChild(track_block_constructor(element, true));
            });
            player_start(playlist);
        }
        else if (xhr.readyState === 4 && xhr.status === 403) forbidden_handler();
        else if (xhr.readyState === 4 && xhr.status === 404){
            tracks_placeholder.textContent = "";
            var results_div = document.createElement("div");
            results_div.className = "single-item";
            var search_div = document.createElement("div");
            search_div.style = "font-weight: bold;";
            search_div.textContent = "Playlist is empty";
            results_div.appendChild(search_div);
            tracks_placeholder.appendChild(results_div);
        }
        show_loader(tracks_loader, false);
    }
    xhr.send();
}

profile();
