// The global empire state
const Gempire = {
    resources: {
        diamondEssence: 100,
        energy: 50,
        gemShards: 0
    }
};

// Function to update the numbers on your screen
function updateResourceUI() {
    document.getElementById('essence-count').innerText = Gempire.resources.diamondEssence;
    document.getElementById('shards-count').innerText = Gempire.resources.gemShards;
}
