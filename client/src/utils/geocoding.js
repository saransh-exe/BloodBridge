const getCityCoordinates = (city) => {
  const cityCoords = {
    'mumbai': [19.0760, 72.8777],
    'delhi': [28.6139, 77.2090],
    'bangalore': [12.9716, 77.5946],
    'bengaluru': [12.9716, 77.5946],
    'chennai': [13.0827, 80.2707],
    'hyderabad': [17.3850, 78.4867],
    'pune': [18.5204, 73.8567],
    'kolkata': [22.5726, 88.3639],
    'ahmedabad': [23.0225, 72.5714],
    'jaipur': [26.9124, 75.7873],
    'surat': [21.1702, 72.8311],
    'lucknow': [26.8467, 80.9462],
    'kanpur': [26.4499, 80.3319],
    'nagpur': [21.1458, 79.0882],
    'indore': [22.7196, 75.8577],
    'bhopal': [23.2599, 77.4126],
    'patna': [25.5941, 85.1376],
    'vadodara': [22.3072, 73.1812],
    'ghaziabad': [28.6692, 77.4538],
    'coimbatore': [11.0168, 76.9558],
    'vellore': [12.9165, 79.1325],
  };

  const key = city?.toLowerCase().trim();
  const coords = cityCoords[key];
  if (coords) return { lat: coords[0], lng: coords[1] };

  return { lat: 20.5937, lng: 78.9629 };
};

module.exports = { getCityCoordinates };