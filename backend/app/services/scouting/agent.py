import asyncio
import re
from typing import List, Dict, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field
import json

import httpx
from bs4 import BeautifulSoup


@dataclass
class ScoutedPlayer:
    name: str
    surname: Optional[str] = None
    club: Optional[str] = None
    category: str = "Division A"
    age: Optional[int] = None
    position: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goals: int = 0
    assists: int = 0
    yellow_cards: int = 0
    red_cards: int = 0
    minutes_played: int = 0
    matches_played: int = 0
    source_url: Optional[str] = None
    raw_data: Optional[Dict] = None


class ScoutingAgent:
    def __init__(self):
        self.sources = [
            {
                "name": "AFA Futsal",
                "url": "https://www.afa.com.ar/futsal",
                "type": "afa",
            },
            {
                "name": "Division A",
                "url": "https://www.afa.com.ar/futsal/division-a",
                "type": "division_a",
            },
        ]
        self.client = httpx.Client(
            timeout=30.0,
            follow_redirects=True,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        )

    def _parse_age(self, text: str) -> Optional[int]:
        match = re.search(r"(\d+)\s*(años|años|edad)", text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None

    def _parse_height(self, text: str) -> Optional[float]:
        match = re.search(r"(\d+[.,]\d+)\s*m\s*", text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", "."))
        match = re.search(r"(\d+)\s*cm", text, re.IGNORECASE)
        if match:
            return float(match.group(1)) / 100
        return None

    def _parse_weight(self, text: str) -> Optional[float]:
        match = re.search(r"(\d+[.,]\d+)\s*kg", text, re.IGNORECASE)
        if match:
            return float(match.group(1).replace(",", "."))
        match = re.search(r"(\d+)\s*kg", text, re.IGNORECASE)
        if match:
            return float(match.group(1))
        return None

    def scrape_afa_futsal(self) -> List[ScoutedPlayer]:
        players = []

        try:
            response = self.client.get("https://www.afa.com.ar/futsal/division-a")
            soup = BeautifulSoup(response.text, "html.parser")

            player_elements = soup.select(".player-card, .jugador-item, tr")

            for element in player_elements:
                try:
                    name_el = element.select_one(".nombre, .player-name, td:nth-child(1)")
                    if not name_el:
                        continue

                    full_name = name_el.get_text(strip=True)
                    name_parts = full_name.split(" ", 1)
                    player_name = name_parts[0]
                    surname = name_parts[1] if len(name_parts) > 1 else None

                    position_el = element.select_one(".posicion, .position, td:nth-child(2)")
                    position = position_el.get_text(strip=True) if position_el else None

                    club_el = element.select_one(".club, .team, td:nth-child(3)")
                    club = club_el.get_text(strip=True) if club_el else None

                    age_el = element.select_one(".edad, .age, td:nth-child(4)")
                    age = self._parse_age(age_el.get_text(strip=True)) if age_el else None

                    text_content = element.get_text()

                    player = ScoutedPlayer(
                        name=player_name,
                        surname=surname,
                        club=club,
                        category="Division A",
                        position=position,
                        age=age,
                        height=self._parse_height(text_content),
                        weight=self._parse_weight(text_content),
                        source_url=response.url,
                    )
                    players.append(player)

                except Exception:
                    continue

        except Exception:
            pass

        return players

    def scrape_futsal_stats(self) -> List[ScoutedPlayer]:
        players = []

        try:
            response = self.client.get(
                "https://www.afa.com.ar/futsal/estadisticas",
            )
            soup = BeautifulSoup(response.text, "html.parser")

            table = soup.select_one("table.estadisticas, table.stats")
            if table:
                rows = table.select("tr")[1:]
                for row in rows:
                    cols = row.select("td")
                    if len(cols) >= 6:
                        players.append(
                            ScoutedPlayer(
                                name=cols[0].get_text(strip=True),
                                club=cols[1].get_text(strip=True) if len(cols) > 1 else None,
                                goals=int(cols[2].get_text(strip=True)) if len(cols) > 2 else 0,
                                assists=int(cols[3].get_text(strip=True)) if len(cols) > 3 else 0,
                                yellow_cards=int(cols[4].get_text(strip=True)) if len(cols) > 4 else 0,
                                red_cards=int(cols[5].get_text(strip=True)) if len(cols) > 5 else 0,
                                category="Division A",
                                source_url=response.url,
                            )
                        )

        except Exception:
            pass

        return players

    def scrape_team_rosters(self) -> List[ScoutedPlayer]:
        players = []
        teams_urls = []

        try:
            response = self.client.get("https://www.afa.com.ar/futsal/clubes")
            soup = BeautifulSoup(response.text, "html.parser")

            for link in soup.select("a[href*='club'], a[href*='equipo']"):
                href = link.get("href")
                if href:
                    teams_urls.append(href if href.startswith("http") else f"https://www.afa.com.ar{href}")

            for url in teams_urls[:10]:
                try:
                    resp = self.client.get(url)
                    soup = BeautifulSoup(resp.text, "html.parser")

                    club_name = soup.select_one("h1, .club-name")
                    club_name = club_name.get_text(strip=True) if club_name else "Unknown"

                    roster = soup.select(".jugador, .player, tr")
                    for player_el in roster:
                        name = player_el.get_text(strip=True).split("\n")[0]
                        if name and len(name) > 2:
                            players.append(
                                ScoutedPlayer(
                                    name=name,
                                    club=club_name,
                                    category="Division A",
                                    source_url=url,
                                )
                            )
                except Exception:
                    continue

        except Exception:
            pass

        return players

    def run_full_scout(self) -> List[ScoutedPlayer]:
        all_players = []
        all_players.extend(self.scrape_afa_futsal())
        all_players.extend(self.scrape_futsal_stats())
        all_players.extend(self.scrape_team_rosters())

        seen = set()
        unique_players = []
        for p in all_players:
            key = f"{p.name}_{p.club}"
            if key not in seen:
                seen.add(key)
                unique_players.append(p)

        return unique_players

    def search_player_info(self, player_name: str) -> Optional[ScoutedPlayer]:
        try:
            search_url = f"https://www.afa.com.ar/buscar?q={player_name.replace(' ', '+')}"
            response = self.client.get(search_url)
            soup = BeautifulSoup(response.text, "html.parser")

            results = soup.select(".resultado, .player-result, .item")
            for result in results[:5]:
                name_el = result.select_one(".nombre, .name, h3")
                if name_el and player_name.lower() in name_el.get_text(strip=True).lower():
                    player = ScoutedPlayer(
                        name=name_el.get_text(strip=True),
                        source_url=response.url,
                    )

                    pos_el = result.select_one(".posicion, .position")
                    if pos_el:
                        player.position = pos_el.get_text(strip=True)

                    club_el = result.select_one(".club, .team")
                    if club_el:
                        player.club = club_el.get_text(strip=True)

                    stats_el = result.select_one(".stats, .estadisticas")
                    if stats_el:
                        pass

                    return player

        except Exception:
            pass

        return None
