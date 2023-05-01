var profile_image_input = document.getElementById("upload-profile-photo");
var tracks_placeholder = document.getElementById("tracks_placeholder");
var player_placeholder = document.getElementById("player_placeholder");

const server_host = "https://sports.delivery-aboba.repl.co";

const methods = ["POST", "PUT", "PATCH", "DELETE"]

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function print(text){
    console.log(text);
}

function not_found_handler(){
    window.location.href = "./404";
}

function forbidden_handler(){
    window.location.href = "./auth";
}

function logout(){
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.location.href = "./auth";
}

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else{
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
            end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
}

if (getCookie("token") == null){
    forbidden_handler();
}

function CustomXHR(method, path, authorization=true){
    var xhr = new XMLHttpRequest();
    xhr.open(method, server_host + path);
    if (methods.includes(method)){ xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); }
    if (authorization == true){ xhr.setRequestHeader('authorization', 'Bearer ' + getCookie("token")); }
    return xhr;
}

function NewsV(endpoint){
    var xhr = CustomXHR("GET", "/sport/news");
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            var items = JSON.parse(xhr.responseText);
            print(items);
            var parent=document.getElementById("NewsTab");
            parent.innerHTML='<div class="mb-8"><h2 class="fw-bold m-0">Новости</h2></div><div class="card-list" id = "NewsList"></div>';
            var parent=document.getElementById("NewsList");
            for(i=0; i<items.topStories.length; i++){
                parent.innerHTML+='<a href="https://www.livescore.com'+items.topStories[i].url+'" class="card border-0 text-reset"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">'+items.topStories[i].title+'</h5></div></div></div></div></a>';
            }
        }        
    }
    xhr.send();
}

var DataMatches = null;

function SportV(endpoint, sport){
    var xhr = CustomXHR("GET", "/sport/?endpoint="+endpoint+"&sport="+sport);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            var items = JSON.parse(xhr.responseText);
            DataMatches = JSON.parse(xhr.responseText);
            print(items);
            var parent=document.getElementById("container");
            parent.innerHTML='<div class="mb-8"><h2 class="fw-bold m-0">Лиги</h2></div><div class="card-list" id = "liga"></div>';
            var parent=document.getElementById("liga");
            for(i=0; i<items.Stages.length; i++){
                //var events = "";
                //item.Events.forEach((EV)=>{
                //    events+='<div class="profile-body"><h4 id="user-profile-name" class="mb-1">'+ EV.T1[0].Nm +'</h4><p id="user-profile-online"></p></div>';
                //});
                //var counter="ads"+getRandomInt(1000000);
                parent.innerHTML+='<a href="#" class="card border-0 text-reset" onclick="Matches('+i+',`'+sport+'`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">'+items.Stages[i].Snm+'</h5></div></div></div></div></a>';
               // var pr = document.createElement("div");
               // pr.className="profile-body";
               // pr.innerHTML='<div class="profile-body"><div class="avatar avatar-xl"><div><img id="user-profile-image" class="avatar-img" src="./source/images/default.svg"></div></div><div class="avatar avatar-xl"><div><img id="user-profile-image" class="avatar-img" src="./source/images/default.svg"></div></div><h4 id="user-profile-name" class="mb-1">'+ item.Events[0].T1[0].Nm +'</h4><p id="user-profile-online"></p></div>';
               // parent.appendChild(pr);
            }
        }        
    }
    xhr.send();
}

function Matches(item, sport){
  var parent=document.getElementById("container");
  parent.innerHTML='<div class="mb-8"><h2 class="fw-bold m-0">'+DataMatches.Stages[item].Snm+'</h2></div><div class="card-list" id = "liga"></div>';
  var parent=document.getElementById("liga");
  for(i=0; i<DataMatches.Stages[item].Events.length; i++){
      var goals1 = DataMatches.Stages[item].Events[i].Tr1;
      var goals2 = DataMatches.Stages[item].Events[i].Tr2;
      var date = DataMatches.Stages[item].Events[i].Esd.toString();
      var temp="";
      for(d=0; d<date.length;d++){
        temp+=date[d];
        if(d==3||d==5){
          temp+="-";
        }
        if(d==7){
          temp+=" ";
        }
        if(d==9||d==11){
          temp+=":";
        }
      }
    if(goals1==undefined){goals1="-"}
    if(goals2==undefined){goals2="-"}
      parent.innerHTML+='<a href="#" onclick="stats('+DataMatches.Stages[item].Events[i].Eid+',`'+sport+'`)" class="card border-0 text-reset"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h3 class="me-auto mb-0">'+DataMatches.Stages[item].Events[i].T1[0].Nm+'</h3><h3>'+goals1+'</h3></div><div class="d-flex align-items-center mb-3"><h3 class="me-auto mb-0">'+DataMatches.Stages[item].Events[i].T2[0].Nm+'</h3><h3>'+goals2+'</h3></div></div></div></div><div class="card-footer">'+temp+'</div></a>';
  }
}

function gen(parent, title, val1, val2){
  var val1=parseInt(val1);
  var val2=parseInt(val2);
  var max_val = val1 + val2;
  var min_val = 0;
  if(max_val!=0){
    parent.innerHTML+='<div style="display: flex;"><span style="display: inline-block; width:10%; margin: 2px;">'+val1+'</span><span style="display: inline-block; width:80%; margin: 2px;">'+title+'</span><span style="display: inline-block; width:10%; margin: 2px;">'+val2+'</span></div>';
    var val_percent = Math.round(100/max_val*val1);
    var val_percent2= 100-val_percent;
    parent.innerHTML+='<div style="display: flex; margin-bottom: 20px;"><div style="display: inline-block; width:50%; margin: 2px;"><div class="progress" style="transform: rotate(180deg);"><div aria-valuemax="'+max_val+'" aria-valuemin="'+min_val+'" aria-valuenow="'+val1+'" style="width: '+val_percent+'%" role="progressbar" class="progress-bar bg-info"></div></div></div><div class="progress" style="display: inline-block; width:50%; margin: 2px;"><div class="progress"><div class="progress-bar bg-warning" role="progressbar" style="width: '+val_percent2+'%" aria-valuenow="'+val2+'" aria-valuemin="'+min_val+'" aria-valuemax="'+max_val+'"></div></div></div></div>';
  }
}

function stats(eid, sport){
  var xhr = CustomXHR("GET", "/sport/stats?eid="+eid+"&sport="+sport);
    xhr.onreadystatechange = function(){
        if (xhr.readyState === 4 && xhr.status === 200){
            var items = JSON.parse(xhr.responseText);
            print(items);
            var parent=document.getElementById("container");
            parent.innerHTML='<div class="mb-8"><h2 class="fw-bold m-0">Статистика</h2></div><div class="card-list" id = "liga" style="text-align: center;"></div>';
            var parent=document.getElementById("liga");
          if(items==null){
            parent.innerHTML="Матч еще не стартовал";
            return;
          }
          items=items.Stat;
          if(items==null){
            parent.innerHTML="Матч еще не стартовал";
            return;
          }
            for(i=0; i<Object.keys(items[0]).length; i++){
              if(i==0){
                gen(parent,"Удары по воротам",items[0].Shon, items[1].Shon);
              }
              if(i==1){
                gen(parent,"Удары мимо ворот",items[0].Shof, items[1].Shof);
              }
              if(i==2){
                gen(parent,"Заблокированные удары",items[0].Shbl, items[1].Shbl);
              }
              if(i==3){
                gen(parent,"Ведений",items[0].Pss, items[1].Pss);
              }
              if(i==4){
                gen(parent,"Перехваты",items[0].Cos, items[1].Cos);
              }
              if(i==5){
                gen(parent,"Офсайды",items[0].Ofs, items[1].Ofs);
              }
              if(i==6){
                gen(parent,"Фоллы",items[0].Fls, items[1].Fls);
              }
              if(i==7){
                gen(parent,"Броски",items[0].Ths, items[1].Ths);
              }
              if(i==8){
                gen(parent,"Желтые карточки",items[0].Ycs, items[1].Ycs);
              }
              if(i==9){
                gen(parent,"Подач с флангов",items[0].Crs, items[1].Crs);
              }
              if(i==10){
                gen(parent,"Контр-атаки",items[0].Att, items[1].Att);
              }
              if(i==11){
                gen(parent,"Отраженные мячи",items[0].Gks, items[1].Gks);
              }
              if(i==12){
                gen(parent,"Забитые мячи",items[0].Goa, items[1].Goa);
              }
              if(i==13){
                gen(parent,"Травмы",items[0].Trt, items[1].Trt);
              }
                //parent.innerHTML+='<a href="https://www.livescore.com'+items.topStories[i].url+'" class="card border-0 text-reset"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">'+items.topStories[i].title+'</h5></div></div></div></div></a>';
            }
        }        
    }
    xhr.send();
}

function GoBack(){
  var parent=document.getElementById("container");
  parent.innerHTML='<div class="mb-8"><h2 class="fw-bold m-0">Виды спорта</h2></div><div class="card-list"><a href="#" class="card border-0 text-reset" onclick="SportV(`matches`,`soccer`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">Футбол</h5></div></div></div></div></a><a href="#" class="card border-0 text-reset" onclick="SportV(`matches`,`basketball`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">Баскетбол</h5></div></div></div></div></a><a href="#" class="card border-0 text-reset" onclick="SportV(`matches`,`hockey`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">Хоккей</h5></div></div></div></div></a><a href="#" class="card border-0 text-reset" onclick="SportV(`matches`,`cricket`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">Крикет</h5></div></div></div></div></a><a href="#" class="card border-0 text-reset" onclick="SportV(`matches`,`tennis`)"><div class="card-body"><div class="row gx-5"><div class="col"><div class="d-flex align-items-center mb-3"><h5 class="me-auto mb-0">Теннис</h5></div></div></div></div></a></div>';
}

GoBack();
