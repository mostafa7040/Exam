let User = JSON.parse(localStorage.getItem('User'))
let score = localStorage.getItem('score');
$('h3').text(`${User.FirstName} ${User.LastName}`)
$('#MyScore').text(score)