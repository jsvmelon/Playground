
    var request = new XMLHttpRequest()

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            var jsonObj = JSON.parse(request.responseText)
            console.log(request.responseText)
            jsonObj.datasets.sort(function(a,b) {
                if (a.dataset_code < b.dataset_code) return -1
                else return 1
            })

            var slider = document.getElementsByClassName("myslider")[0]
            var items = 0 
            var sliderDiv, rowDiv, div, calloutDiv 
            jsonObj.datasets.forEach(function(element) {
                if (items % 12 === 0) {
                    sliderDiv = document.createElement("div")
                    slider.appendChild(sliderDiv)
                }
                
                if (items % 4 === 0) {
                    rowDiv = document.createElement("div")
                    rowDiv.className = "row inSlider"
                    sliderDiv.appendChild(rowDiv)
                }   
                
                div = document.createElement("div")
                //if (items % 4 === 0) { div.className = "large-2 columns large-offset-2"}
                //else if (items % 4 === 3) { div.className = "large-2 columns end" }
                //else div.className = "large-2 columns"
                div.className = "large-3 columns"
                rowDiv.appendChild(div)
                
                calloutDiv = document.createElement("div")
                calloutDiv.className = "primary callout text-center"
                calloutDiv.innerText = element.dataset_code
                div.appendChild(calloutDiv)
                
                items++
            });            

            // remove the waiting image
            var waiterImage = document.getElementById("waiter")
            waiterImage.style.display = "none"
            
            // activate the slick slider
            $(document).ready(function(){
                $('.myslider').slick({
                    dots: true,
                });
            });

            // now adjust the position of the buttons
            var dots = document.getElementsByClassName('slick-dots')[0]        
            var leftArrow = document.getElementsByClassName("slick-prev slick-arrow")[0]
            var correctTopMeasure = ((slider.clientHeight - dots.clientHeight - leftArrow.clientHeight / 2) / 2) + 'px'
            leftArrow.style.top = correctTopMeasure
            document.getElementsByClassName("slick-next slick-arrow")[0].style.top = correctTopMeasure
        }
    }

    request.open('GET', 'https://www.quandl.com/api/v3/datasets.json?database_code=WIKI&api_key=byQHh5K2zT4MKss4ztMG&page=1', true)
    request.send()
