async function fetchArtists() {
    const artistDeets = document.getElementById("artistDetails");
    artistDeets.innerHTML="";

    const gifContainer = document.getElementById("loadingGIF");
    const artistsContainer = document.getElementById("artistImages");
    const gifContainer2 = document.getElementById("loadingGIF2");

    const size_artistsContainer = artistsContainer.children.length;

    if(size_artistsContainer>0){
        gifContainer2.style = "display: block"
        gifContainer.style = "display: none"
    }
    else{
        gifContainer2.style = "display: none"
        gifContainer.style = "display: block"
    }

    const searchQuery = document.getElementById("q").value;

    try{
        const response = await fetch(`https://csci-571-sonia.wl.r.appspot.com/search?q=${encodeURIComponent(searchQuery)}`);
        if(!response.ok){
            throw new Error("could not find any results");
        }

        const data = await response.json();
        // console.log(data);
        if (!data || data.length === 0) {

            const noartists = document.getElementById("noartistsfound");
            noartists.textContent = "No results found.";
            noartists.style.display="flex";

            const artistsContainer = document.getElementById("artistImages");
            artistsContainer.innerHTML="";
        }
        else{
        artistsContainer.innerHTML="";

        const noartists = document.getElementById("noartistsfound");
        noartists.style.display="none";

        let prevCard = null;

        data.forEach(artist => {

            const imageContainer = document.createElement("div");
            imageContainer.className="rectangularShadow";
            imageContainer.id="rectShadow";
            imageContainer.addEventListener('click', function(){
                const artistDeets = document.getElementById("artistDetails");
                artistDeets.innerHTML="";
                gifContainer2.style = "display: block";
                fetchArtistDetails(artist.artist_ID);
                if(prevCard && prevCard!=imageContainer){
                    prevCard.style="background-color:#205375";
                }
                imageContainer.style="background-color: #112B3C";
                prevCard = imageContainer;
            });

            const imgElement = document.createElement("img");
            imgElement.src=artist.artist_Image;
            imgElement.alt=artist.artist_Title;

            const imgTitle = document.createElement("div");
            imgTitle.className = "imageTitle";
            imgTitle.textContent = artist.artist_Title;
            
            imageContainer.appendChild(imgElement);
            imageContainer.appendChild(imgTitle);
            artistsContainer.appendChild(imageContainer);
        });       
        }
        gifContainer.style = "display: none";
        gifContainer2.style = "display: none";

    }
    catch(error){
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("artistForm").addEventListener("submit", function(event) {
        console.log("form submitted");
        event.preventDefault();  // Prevents page reload
        fetchArtists(event);
    });
});


async function fetchArtistDetails(artistID) {
    try{
        const response = await fetch(`https://csci-571-sonia.wl.r.appspot.com/artist-details/${artistID}`)

        const gifContainer = document.getElementById("loadingGIF2");
        // gifContainer.style = "display: block";

        if(!response.ok){
            throw new Error("Could not find artist details");
        }

        const data = await response.json();
        const artistDeets = document.getElementById("artistDetails");
        // artistDeets.innerHTML="";

        const artistHeading = document.createElement("div");
        artistHeading.className="artist_heading";
        artistHeading.textContent=`${data.artist_name} (${data.artist_bday}-${data.artist_dday})`;

        const artistNationality = document.createElement("div");
        artistNationality.className="artist_nationality";
        artistNationality.textContent=`${data.artist_nationality}`;

        const artistBiography = document.createElement("p");
        artistBiography.className="artist_Biography";
        artistBiography.textContent=`${data.artist_biography}`;

        artistDeets.appendChild(artistHeading);
        artistDeets.appendChild(artistNationality);
        artistDeets.appendChild(artistBiography);
        gifContainer.style = "display: none"
    }
    catch(error){
        console.error(error);
    }
}
