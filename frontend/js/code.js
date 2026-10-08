const urlBase = (typeof window !== 'undefined' && window.location && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.origin.includes('cop4331lamp13')))
  ? '/lamp/api/auth/login.php'
  : 'https://cop4331lamp13.xyz/lamp/api/auth/login.php';

//const loginUrlBase = urlBase;
const loginUrlBase = 'https://cop4331lamp13.xyz/lamp/api/auth/login.php';
const registerURLBase = 'https://cop4331lamp13.xyz/lamp/api/auth/register.php';
const searchURLBase = 'https://cop4331lamp13.xyz/lamp/api/search/searchContacts.php?q=';
const contactURLBase = 'https://cop4331lamp13.xyz/lamp/api/paging/getContacts.php?page=';
const createContactUrl = "https://cop4331lamp13.xyz/lamp/api/manage/createContact.php";
const updateContactUrl = "https://cop4331lamp13.xyz/lamp/api/manage/updateContact.php";
const deleteContactUrl = "https://cop4331lamp13.xyz/lamp/api/manage/deleteContact.php";

const createAdminUrl = "https://cop4331lamp13.xyz/lamp/api/admin/createAdmin.php";
const getUsersURL = "https://cop4331lamp13.xyz/lamp/api/admin/getUsers.php";
const suspendURL = "https://cop4331lamp13.xyz/lamp/api/admin/suspendUser.php";
const changePassURL = "https://cop4331lamp13.xyz/lamp/api/admin/changePassword.php";
const promoteURL = "https://cop4331lamp13.xyz/lamp/api/admin/promoteUser.php";

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin() {
  userId = 0;
  firstName = "";
  lastName = "";

  let loginInput = document.getElementById("loginName");
  let passwordInput = document.getElementById("loginPassword");
  let login = loginInput ? loginInput.value.trim() : "";
  let password = passwordInput ? passwordInput.value.trim() : "";

  document.getElementById("loginResult").innerHTML = "";

  let jsonPayload = JSON.stringify({ login: login, password: password });
  let url = loginUrlBase;

  let xhr = new XMLHttpRequest();
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        if (this.status === 200) {
          let jsonObject = (JSON.parse(xhr.responseText)).user;
          console.log(jsonObject);
          userId = jsonObject.id;
          isAdmin = (jsonObject.role == "Admin");

          if (userId < 1) {
            document.getElementById("loginResult").innerHTML =
              "<i class='bi bi-exclamation-circle-fill me-1'></i> User/Password combination incorrect";
            return;
          }

          firstName = jsonObject.firstName;
          lastName = jsonObject.lastName;
          userTeamName = jsonObject.teamName;

          saveCookie();
          window.location.href = "manage.html";
        } else if (this.status == 403){
          document.getElementById("loginResult").innerHTML =
          "<i class='bi bi-exclamation-circle-fill me-1'></i> User Suspended";
        
        }else {
          document.getElementById("loginResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> Login failed";
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("loginResult").innerHTML = err.message;
  }
}

function doRegister(){
  let loginInput = document.getElementById("loginName");
  let passwordInput = document.getElementById("loginPassword");
  let passConf = document.getElementById("confirmPassword");
  let fNameInput = document.getElementById("firstName");
  let lNameInput = document.getElementById("lastName");
  let tNameInput = document.getElementById("teamName");
  let login = loginInput ? loginInput.value.trim() : "";
  let password = passwordInput ? passwordInput.value.trim() : "";
  let confirmPass = passConf ? passConf.value.trim() : "";
  let firstName = fNameInput ? fNameInput.value.trim() : "";
  let lastName = lNameInput ? lNameInput.value.trim() : "";
  let teamName = tNameInput ? tNameInput.value.trim() : "";
  document.getElementById("loginResult").innerHTML = ""
  if(password === confirmPass){
    let jsonPayload = JSON.stringify({ firstName: firstName, lastName: lastName, login: login, password: password, teamName: teamName });
    let url = registerURLBase;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 201) {
            document.getElementById("loginResult").innerHTML = "Success!"

            window.location.href = "index.html";
          } else {
            document.getElementById("loginResult").innerHTML =
              "<i class='bi bi-exclamation-circle-fill me-1'></i> Registration failed";
          }
        }
      };
      xhr.send(jsonPayload);
    } catch (err) {
      document.getElementById("loginResult").innerHTML = err.message;
    }

  }else{
    document.getElementById("loginResult").innerHTML = "Password and Confirmation do not match";
  }
}

function saveCookie() {
  let minutes = 20;
  let date = new Date();
  date.setTime(date.getTime() + minutes * 60 * 1000);
  document.cookie =
    "firstName=" +
    encodeURIComponent(firstName) +
    ",lastName=" +
    encodeURIComponent(lastName) +
    ",teamName=" +
    encodeURIComponent(userTeamName) +
    ",userId=" +
    userId +
    ",isAdmin=" +
    isAdmin +
    ";expires=" +
    date.toGMTString() +
    ";path=/";
}

function readCookie() {
  userId = -1;
  let data = document.cookie;
  let splits = data.split(";");
  for (var i = 0; i < splits.length; i++) {
    let pair = splits[i].trim();
    let tokens = pair.split(",");
    for (var j = 0; j < tokens.length; j++) {
      let keyVal = tokens[j].trim().split("=");
      if (keyVal[0] === "firstName") {
        firstName = decodeURIComponent(keyVal[1] || "");
      } else if (keyVal[0] === "lastName") {
        lastName = decodeURIComponent(keyVal[1] || "");
      } else if (keyVal[0] === "teamName") {
        teamName = decodeURIComponent(keyVal[1] || "");
      } else if (keyVal[0] === "userId") {
        userId = parseInt(keyVal[1].trim());
      } else if (keyVal[0] === "isAdmin") {
        isAdmin = (decodeURIComponent(keyVal[1] || "") === "true");
      }
    }
  }

  if (userId < 0 || isNaN(userId)) {
    window.location.href = "index.html";
  } else {
    let userNameEl = document.getElementById("userName");
    if (userNameEl) {
      userNameEl.innerHTML = `<i class="bi bi-person-circle me-1 text-primary"></i> <span>Logged in as <strong class="text-white">${firstName} ${lastName}</strong></span>`;
    }
    // let informationSpan = document.getElementById("infoSpan");
    // if(informationSpan){
    //   informationSpan.innerHTML=`<span>UserID: ${userId}<br> First Name: ${firstName}<br> Last Name: ${lastName}<br> Team Name: ${teamName}</span>`
    // }
    // searchColor();
  }
  if (isAdmin){
    document.getElementById("manageUsersTab").style.visibility = "visible"
  } else{
    document.getElementById("manageUsersTab").style.visibility = "hidden"
  }
}

function doLogout() {
  userId = 0;
  firstName = "";
  lastName = "";
  document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "lastName=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  window.location.href = "index.html";
}

function doSearch() {
  let initQuery = document.getElementById("searchBar");
  let query = initQuery ? initQuery.value.trim() : "";
  if(query == ""){return}
  let jsonPayload = "";
  let url = searchURLBase + query;
  let filterSpan = document.getElementById("errorSpan");
  let pagination = document.getElementById("pagination");
  const selectedPositions = [...document.querySelectorAll('.position-entry input[type="checkbox"]:checked')]
    .map(checkbox => checkbox.value);

  const selectedSides = [...document.querySelectorAll('.side-entry input[type="checkbox"]:checked')]
    .map(checkbox => checkbox.value);
  if(filterSpan){
    filterSpan.innerHTML=``
  }

    let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("X-User-Id", userId);
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            console.log("Status 200")
            let jsonObject = (JSON.parse(xhr.responseText)).results;
            if(pagination){
              pagination.style= "visibility: hidden"
            }
            displayResults(jsonObject, selectedPositions, selectedSides);
          }else{
            if(filterSpan){
              filterSpan.innerHTML=`Error Processing Request`
            }
        }
      }
      };
      xhr.send(jsonPayload);
    } catch (err) {
    }

}

function getContacts(page){
  let jsonPayload = "";
  const selectedPositions = [...document.querySelectorAll('.position-entry input[type="checkbox"]:checked')]
    .map(checkbox => checkbox.value);

  const selectedSides = [...document.querySelectorAll('.side-entry input[type="checkbox"]:checked')]
    .map(checkbox => checkbox.value);

  let url = contactURLBase+page;

  if (selectedPositions.length > 0) {
    url += "&positions=" + encodeURIComponent(selectedPositions.join(","));
  }
  if (selectedSides.length > 0) {
    url += "&sides=" + encodeURIComponent(selectedSides.join(","));
  }
  let pagination = document.getElementById("pagination");
  let filterSpan = document.getElementById("errorSpan");
  let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("X-User-Id", userId);
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            console.log("Status 200")
            let jsonObject = (JSON.parse(xhr.responseText)).results;
            if(pagination){
              pagination.style.visibility = "visible"
              document.getElementById("pageNumber").textContent = page
              currentPage = page;
            }
            displayResults(jsonObject, selectedPositions, selectedSides);
          }else{
            if(filterSpan){
              filterSpan.innerHTML=`Error Processing Request`
            }
        }
      }
      };
      xhr.send(jsonPayload);
    } catch (err) {
    }

}


function displayResults(results, positions, sides) {
    let filterSpan = document.getElementById("errorSpan");
    const container = document.getElementById("queryResults");
    defaultPos = false;
    defaultSides = false
    if (positions.length == 0){
      positions = Array.from(document.querySelectorAll(".position-entry input[type='checkbox']"))
                      .map(cb => cb.value);
      defaultPos = true;
    }
    if (sides.length == 0){
      sides = ["Offense", "Defense"];
      defaultSides = true
    }
    if(filterSpan){
      filterSpan.innerHTML=""
      if(!defaultPos || !defaultSides){
        filterSpan.innerHTML += "Filtering By: "
      }
      if(!defaultPos){
        filterSpan.innerHTML += positions
        if(!defaultSides){filterSpan.innerHTML +=","}
      }
      if(!defaultSides){
        filterSpan.innerHTML += sides
      }

    }
    anyValid = false;
    container.innerHTML = "";
    resolveLogins(results, function(){
    results.forEach(row => {
        if (!(positions.includes(row.position)) || !(sides.includes(row.side))){
          return;
        }
        anyValid = true;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.firstName}</td>
            <td>${row.lastName}</td>
            <td>${row.phone}</td>
             <td><a href="mailto:${row.email}">${row.email}</a></td>
            <td>${row.position}</td>
            <td>${row.side}</td>
            <td>${row.teamName}</td>
            ${isAdmin ? `<td>${loginCache[row.userId]}</td>` : "<td></td>"}
            <td type="hidden" id="contactID"></td>
            <td class="text-end">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="modifyContact(${row.id},this)">Modify</button>
            </td>
                `;

        container.appendChild(tr);
    });

    if(!anyValid){
      container.innerHTML = "<td>No Results</td><td></td><td></td><td></td><td></td><td></td><td></td>";
    }
  });
    
}


let currentPage = 1;

function changePage(direction) {
  let newPage = currentPage + direction;
  if (newPage < 1) return;

  currentPage = newPage;
  document.getElementById("pageNumber").textContent = currentPage;
  getContacts(currentPage);
}

function modifyContact(rowID, btn) {
  const cells = btn.closest("tr").children;

  document.getElementById("modifyContactId").value = rowID;
  document.getElementById("modifyfirstName").value = cells[0].textContent.trim();
  document.getElementById("modifylastName").value  = cells[1].textContent.trim();
  document.getElementById("modifyphone").value     = cells[2].textContent.trim();
  document.getElementById("modifyemail").value     = cells[3].textContent.trim();
  document.getElementById("modifyposition").value  = cells[4].textContent.trim();

  const side = cells[5].textContent.trim();
  const sideInput = document.querySelector(`input[name="modifySide"][value="${side}"]`);
  if (sideInput) sideInput.checked = true;
  document.getElementById("modifyteamName").value  = cells[6].textContent.trim();


  bootstrap.Modal.getOrCreateInstance(document.getElementById("modifyModal")).show();
}

function closeModal(){
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modifyModal")).hide();
}

// ---------- CREATE (POST) ----------
function addContact() {
  let firstName = document.getElementById("firstName").value.trim();
  let lastName = document.getElementById("lastName").value.trim();
  let phone = document.getElementById("phone").value.trim();
  let email = document.getElementById("email").value.trim();
  let position = document.getElementById("position").value;
  let sideInput = document.querySelector('input[name="side"]:checked');
  let side = sideInput ? sideInput.value : "";

  document.getElementById("contactResult").innerHTML = "";

  let jsonPayload = JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    email: email,
    position: position,
    side: side
  });

  let xhr = new XMLHttpRequest();
  xhr.open("POST", createContactUrl, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 201 || this.status === 200) {
          console.log("Created contact id:", response.contactId);
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> Contact added";
          document.getElementById("addContactForm").reset();
          getContacts(currentPage);
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not add contact");
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

// ---------- UPDATE (PUT) ----------
function updateContact() {
  document.getElementById("contactResult").innerHTML = "";

    let id = document.getElementById("modifyContactId").value
    let firstName = document.getElementById("modifyfirstName").value.trim();
    let lastName = document.getElementById("modifylastName").value.trim();
    let phone = document.getElementById("modifyphone").value.trim();
    let email = document.getElementById("modifyemail").value.trim();
    let position = document.getElementById("modifyposition").value;
    let teamName = document.getElementById("modifyteamName").value.trim();
    let sideInput = document.querySelector('input[name="modifySide"]:checked');
    let side = sideInput ? sideInput.value : "";

  let jsonPayload = JSON.stringify({
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    email: email,
    position: position,
    side: side,
    teamName: teamName
  });

  let url = updateContactUrl + "?id=" + encodeURIComponent(id);

  let xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 200) {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> Contact updated";
          getContacts(currentPage);
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not update contact");
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

// ---------- DELETE ----------
function deleteContact() {
  let id = document.getElementById("modifyContactId").value
  document.getElementById("contactResult").innerHTML = "";

  let url = deleteContactUrl + "?id=" + encodeURIComponent(id);

  let xhr = new XMLHttpRequest();
  xhr.open("DELETE", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 200) {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> Contact deleted";
          getContacts(currentPage)
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not delete contact");
        }
      }
    };
    xhr.send();
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

//------------ADMIN TASKS---------------

function createUser(){
const isChecked = document.getElementById("adminCheckbox").checked;

if (isChecked) {
  createAdmin()
} else{
  createNormalUser()
}
}

function createAdmin(){
  let loginInput = document.getElementById("loginName");
  let passwordInput = document.getElementById("loginPassword");
  let passConf = document.getElementById("confirmPassword");
  let fNameInput = document.getElementById("firstName");
  let lNameInput = document.getElementById("lastName");
  let tNameInput = document.getElementById("teamName");
  let login = loginInput ? loginInput.value.trim() : "";
  let password = passwordInput ? passwordInput.value.trim() : "";
  let confirmPass = passConf ? passConf.value.trim() : "";
  let firstName = fNameInput ? fNameInput.value.trim() : "";
  let lastName = lNameInput ? lNameInput.value.trim() : "";
  let teamName = tNameInput ? tNameInput.value.trim() : "";
  document.getElementById("contactResult").innerHTML = ""
  if(password === confirmPass){
    let jsonPayload = JSON.stringify({ firstName: firstName, lastName: lastName, login: login, password: password, teamName: teamName });
    let url = createAdminUrl;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("X-User-Id", userId);
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 201) {
            document.getElementById("contactResult").innerHTML = "Success!"
            getUsers();

          } else {
            document.getElementById("contactResult").innerHTML =
              "<i class='bi bi-exclamation-circle-fill me-1'></i> Registration failed";
          }
        }
      };
      xhr.send(jsonPayload);
    } catch (err) {
      document.getElementById("contactResult").innerHTML = err.message;
    }

  }else{
    document.getElementById("contactResult").innerHTML = "Password and Confirmation do not match";
  }
}

function createNormalUser(){
  let loginInput = document.getElementById("loginName");
  let passwordInput = document.getElementById("loginPassword");
  let passConf = document.getElementById("confirmPassword");
  let fNameInput = document.getElementById("firstName");
  let lNameInput = document.getElementById("lastName");
  let tNameInput = document.getElementById("teamName");
  let login = loginInput ? loginInput.value.trim() : "";
  let password = passwordInput ? passwordInput.value.trim() : "";
  let confirmPass = passConf ? passConf.value.trim() : "";
  let firstName = fNameInput ? fNameInput.value.trim() : "";
  let lastName = lNameInput ? lNameInput.value.trim() : "";
  let teamName = tNameInput ? tNameInput.value.trim() : "";
  document.getElementById("contactResult").innerHTML = ""
  if(password === confirmPass){
    let jsonPayload = JSON.stringify({ firstName: firstName, lastName: lastName, login: login, password: password, teamName: teamName });
    let url = registerURLBase;

    let xhr = new XMLHttpRequest();

    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 201) {
            document.getElementById("contactResult").innerHTML = "Success!"
            getUsers();
          } else {
            document.getElementById("contactResult").innerHTML =
              "<i class='bi bi-exclamation-circle-fill me-1'></i> Registration failed";
          }
        }
      };
      xhr.send(jsonPayload);
    } catch (err) {
      document.getElementById("contactResult").innerHTML = err.message;
    }

  }else{
    document.getElementById("contactResult").innerHTML = "Password and Confirmation do not match";
  }
}

function getUsers(){
  let jsonPayload = "";
  let url = getUsersURL;
  const selectedPositions = []
  const selectedSides = []
  let filterSpan = document.getElementById("errorSpan");
  let xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.setRequestHeader("X-User-Id", userId);
    try {
      xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
          if (this.status === 200) {
            console.log("Status 200")
            let jsonObject = (JSON.parse(xhr.responseText)).results;
            displayUsers(jsonObject);
          }else{
            if(filterSpan){
              filterSpan.innerHTML=`Error Processing Request`
            }
        }
      }
      };
      xhr.send(jsonPayload);
    } catch (err) {
    }

}

function displayUsers(results) {
    let filterSpan = document.getElementById("errorSpan");
    const container = document.getElementById("queryResults");
    
    anyValid = false;
    container.innerHTML = "";

    results.forEach(row => {
        anyValid = true;
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${row.firstName}</td>
            <td>${row.lastName}</td>
            <td>${row.login}</td>
            <td>${row.teamName}</td>
            <td>${row.role}</td>
            <td>${row.id}</td>
            <td>
              <i class="bi bi-circle-fill ${row.disabled ? 'text-danger' : 'text-success'}"
                role="img"
                aria-label="${row.disabled ? 'Disabled' : 'Enabled'}"
                title="${row.disabled ? 'Disabled' : 'Enabled'}"></i>
            </td>
            <td class="text-end">
                <button type="button" class="btn btn-outline-primary btn-sm" onclick="modifyUser(${row.id}, ${row.disabled}, '${row.role}')">Modify</button>
            </td>
                `;

        container.appendChild(tr);
    });
    if(!anyValid){
      container.innerHTML = "<td>No Results</td><td></td><td></td><td></td><td></td><td></td><td></td>";
    }
}

function modifyUser(rowID, disabled, role) {
  document.getElementById("restoreUserButton").classList.toggle("d-none", !disabled);
  document.getElementById("suspendUserButton").classList.toggle("d-none", disabled);
  document.getElementById("promoteUserButton").classList.toggle("d-none", role === "Admin");
  document.getElementById("modifyContactId").value = rowID;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("modifyModal")).show();
}

function updateUser(isDisabled) {
  document.getElementById("contactResult").innerHTML = "";

  let id = document.getElementById("modifyContactId").value
  let jsonPayload = JSON.stringify({
    userId: id,
    disabled: isDisabled
  });

  let url = suspendURL
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 200) {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> User updated";
          getUsers();
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not update user");
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

function promoteUser() {
  document.getElementById("contactResult").innerHTML = "";

  let id = document.getElementById("modifyContactId").value
  let jsonPayload = JSON.stringify({
    userId: id
  });

  let url = promoteURL
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 200) {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> " +
            (response.message || "User promoted to admin.");
          getUsers();
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not promote user");
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

function changePassword() {
  document.getElementById("contactResult").innerHTML = "";

  let id = document.getElementById("modifyContactId").value
  let password = document.getElementById("modifyPassword").value.trim();
  let jsonPayload = JSON.stringify({
    userId: id,
    password: password
  });

  let url = changePassURL;
  let xhr = new XMLHttpRequest();
  xhr.open("PUT", url, true);
  xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
  xhr.setRequestHeader("X-User-Id", userId);
  try {
    xhr.onreadystatechange = function () {
      if (this.readyState === 4) {
        let response = {};
        try { response = JSON.parse(xhr.responseText); } catch (e) {}

        if (this.status === 200) {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-check-circle-fill me-1'></i> User updated";
          getUsers();
        } else {
          document.getElementById("contactResult").innerHTML =
            "<i class='bi bi-exclamation-circle-fill me-1'></i> " +
            (response.error || "Could not update user");
        }
      }
    };
    xhr.send(jsonPayload);
  } catch (err) {
    document.getElementById("contactResult").innerHTML = err.message;
  }
}

const loginCache = {};
const whoisURL = "https://cop4331lamp13.xyz/lamp/api/auth/me.php";

// Looks up one userID (skips the request if already cached)
function lookupLogin(userID, done){
  if (loginCache[userID] !== undefined){
    done();
    return;
  }

  let xhr = new XMLHttpRequest();
  xhr.open("GET", whoisURL, true);
  xhr.setRequestHeader("X-User-Id", userID);

  xhr.onreadystatechange = function () {
    if (this.readyState === 4){
      if (this.status === 200){
        loginCache[userID] = JSON.parse(xhr.responseText).user.login;
      } else {
        loginCache[userID] = " ";
      }
      done();
    }
  };
  xhr.send();
}

// Looks up every unique userID in the contacts, then calls done()
function resolveLogins(contacts, done){
  const ids = [...new Set(contacts.map(c => c.userId))];
  let remaining = ids.length;

  if (remaining === 0){
    done();
    return;
  }

  ids.forEach(function(id){
    lookupLogin(id, function(){
      remaining--;
      if (remaining === 0) done();
    });
  });
}
