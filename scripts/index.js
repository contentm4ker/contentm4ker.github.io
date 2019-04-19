$(document).ready(function() {

  $('#users-table-container').css('display', 'none');

  // Open Api init
  VK.init({
    apiId: 6951132 //VK App ID
  });

  changeActionDependOnAuthStatus();

  if (localStorage['VK_SESSION_USER']) {
    fillUserFriendsTable(localStorage['VK_SESSION_USER']);
  }

  VK.Observer.subscribe('auth.login', function(event) {
    if (event.session.user) {
      localStorage['VK_SESSION_USER'] = event.session.user.id;
      localStorage['VK_SESSION_STATUS'] = event.status;
      fillUserFriendsTable(event.session.user.id);
      changeActionDependOnAuthStatus();
    }
  });

  VK.Observer.subscribe('auth.logout', function(event) {
    localStorage['VK_SESSION_USER'] = null;
    localStorage['VK_SESSION_STATUS'] = event.status;
    changeActionDependOnAuthStatus();
  });


  function fillUserFriendsTable(user_id) {
    VK.Api.call(
      'friends.get',
      {
        user_id: user_id, 
        order: 'hints',
        fields: 'domain',
        count: 5,
        version: '5.95'
      },
      function(r) {
        if(r.response) {
          var userFriends = r.response;
          $("#users-table tbody tr").empty()
          for (var i = 0; i < userFriends.length; i++) {
            $('#users-table tbody').append(`
              <tr class="w3-hover-blue">
              <td>${userFriends[i]['first_name']}</td>
              <td>${userFriends[i]['last_name']}</td>
              <td>${userFriends[i]['online'] ? 'Да' : 'Нет'}</td>
              <td><a href="${'https://vk.com/' + userFriends[i]['domain']}">${'https://vk.com/' + userFriends[i]['domain']}</a></td>
              </tr>
              `);
          }
        }
    });
  }

  function changeActionDependOnAuthStatus() {
    if (localStorage['VK_SESSION_STATUS'] === 'connected') {
      $('#users-table-container').css('display', 'block');
      $('#info-text').text(`Добро пожаловать, 
        ${localStorage['USER_NAME']}!`);
      $("#auth-btn").html('Выйти');

      $('#auth-btn').unbind('click');
      $('#auth-btn').on('click', function() {
        VK.Auth.logout(function(response) {
          if (!response.session) {
            console.log('disconnect');
          } 
        });
      });
    } else {
      $('#users-table-container').css('display', 'none');
      $('#info-text').text('Авторизация ВКонтакте');
      $("#auth-btn").html('Авторизоваться');

      $('#auth-btn').unbind('click');
      $('#auth-btn').on('click', function() {
        VK.Auth.login(function(response) {
          if (response.session) {
            /* user successfully auth */
            var user = response.session.user;
            localStorage['USER_NAME'] = user.last_name + ' ' + user.first_name;
          } 
        });
      });
    }
  }

});