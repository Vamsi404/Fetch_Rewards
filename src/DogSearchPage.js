import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Box,
  Chip,
  Select,
  MenuItem,
  Button,
  ButtonGroup
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import LogoutIcon from "@mui/icons-material/Logout";

function DogSearchPage({ onLogout }) {
  const [breeds, setBreeds] = useState([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [dogs, setDogs] = useState([]);
  const [resultIds, setResultIds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("breed:asc");
  const [matchId, setMatchId] = useState(null);
  const dogRefs = useRef({});
  const pageSize = 12; // Dogs per page

  // Fetch available breeds on load
  useEffect(() => {
    fetch("https://frontend-take-home-service.fetch.com/dogs/breeds", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setBreeds)
      .catch(console.error);
  }, []);

  // Fetch dog IDs when filters/page/sort change
  useEffect(() => {
    let params = [];
    if (selectedBreed) params.push(`breeds=${encodeURIComponent(selectedBreed)}`);
    params.push(`size=${pageSize}`);
    params.push(`from=${page * pageSize}`);
    params.push(`sort=${sort}`);
    const url = `https://frontend-take-home-service.fetch.com/dogs/search?${params.join("&")}`;
    fetch(url, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setResultIds(data.resultIds || []);
      })
      .catch(console.error);
  }, [selectedBreed, page, sort]);

  // Fetch dog objects from IDs
  useEffect(() => {
    if (resultIds.length === 0) {
      setDogs([]);
      return;
    }
    fetch("https://frontend-take-home-service.fetch.com/dogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(resultIds),
    })
      .then((res) => res.json())
      .then(setDogs)
      .catch(console.error);
  }, [resultIds]);

  // Auto-scroll to matched dog
  useEffect(() => {
    if (matchId && dogRefs.current[matchId]) {
      dogRefs.current[matchId].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [matchId, dogs]);

  // Toggle favorites
  const toggleFavorite = (id) => {
    setFavorites((favs) =>
      favs.includes(id) ? favs.filter((d) => d !== id) : [...favs, id]
    );
  };

  return (
    <Box maxWidth={900} mx="auto" p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Browse Dogs
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Filter and Sort Controls */}
      <Box display="flex" gap={2} mb={3}>
        <Select
          value={selectedBreed}
          onChange={e => setSelectedBreed(e.target.value)}
          size="small"
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Breeds</MenuItem>
          {breeds.map(breed => (
            <MenuItem key={breed} value={breed}>{breed}</MenuItem>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={e => setSort(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="breed:asc">Breed (A-Z)</MenuItem>
          <MenuItem value="breed:desc">Breed (Z-A)</MenuItem>
        </Select>

        <Button
          variant="contained"
          color="success"
          disabled={favorites.length === 0}
          onClick={async () => {
            const res = await fetch("https://frontend-take-home-service.fetch.com/dogs/match", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(favorites),
            });
            const match = await res.json();
            setMatchId(match.match);
          }}
        >
          Find My Match!
        </Button>
      </Box>

      {/* Dog Cards Grid */}
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)"
        }}
        gap={3}
        mb={3}
      >
        {dogs.map((dog) => (
          <Card
            key={dog.id}
            ref={el => dogRefs.current[dog.id] = el}
            sx={{
              border: dog.id === matchId ? "3px solid #32CD32" : "1px solid #ddd",
              boxShadow: dog.id === matchId ? "0 0 16px 2px #32CD32" : 2,
              borderRadius: 3,
              background: dog.id === matchId ? "#eaffea" : "#fff",
              position: "relative",
              transition: "box-shadow 0.3s"
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={dog.img}
              alt={dog.name}
              sx={{ objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" fontWeight={600}>{dog.name}</Typography>
              <Chip label={dog.breed} size="small" sx={{ mb: 1, mt: 1 }} />
              <Typography variant="body2" color="text.secondary">
                <b>Age:</b> {dog.age}<br />
                <b>Zip:</b> {dog.zip_code}
              </Typography>
              <Box mt={1}>
                <IconButton
                  color={favorites.includes(dog.id) ? "warning" : "default"}
                  onClick={() => toggleFavorite(dog.id)}
                >
                  {favorites.includes(dog.id) ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>
                {dog.id === matchId && (
                  <Chip
                    label="MATCHED!"
                    color="success"
                    size="small"
                    sx={{ position: "absolute", top: 10, right: 10, fontWeight: "bold" }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Pagination */}
      <Box mt={2} display="flex" justifyContent="center">
        <ButtonGroup>
          <Button disabled={page === 0} onClick={() => setPage(p => Math.max(p - 1, 0))}>Previous</Button>
          <Button disabled>Page {page + 1}</Button>
          <Button onClick={() => setPage(p => p + 1)}>Next</Button>
        </ButtonGroup>
      </Box>
    </Box>
  );
}

export default DogSearchPage;
