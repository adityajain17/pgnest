// console.log("Connected");
// console.log(parsed_data);
var fetch_word=document.getElementById("real-cloud");
fetch_word.addEventListener('click',function()
{
    console.log("Button clicked");
    fetch('/word-cloud/'+parsed_data)
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        if(data=="200"){
            // console.log('Word Cloud Done');
            var cloud=document.getElementById("cloud");
            fetch_word.style.visibility='hidden';
            cloud.style.visibility='visible';
        }
        else
            window.alert('Not enough reviews to generate the word-cloud');
    });
});