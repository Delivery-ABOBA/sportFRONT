fetch('http://localhost:8002/anketa/api/application-doc', {method: 'POST'})
  .then(response => response.blob())
  .then(blob => {
    const reader = new FileReader();
    reader.onload = function() {
      const decodedContents = reader.result;
      document.getElementById('mydiv').innerHTML = decodedContents;
    }
    reader.readAsText(blob, 'utf-8');
  });
 