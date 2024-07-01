import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, MenuItem, Typography, Paper } from '@material-ui/core';
import * as d3 from 'd3';

const strategies = {
  titForTat: (history) => history.length === 0 ? 'C' : history[history.length - 1].human,
  alwaysCooperate: () => 'C',
  alwaysDefect: () => 'D',
  random: () => Math.random() < 0.5 ? 'C' : 'D',
  pavlov: (history) => {
    if (history.length === 0) return 'C';
    const lastRound = history[history.length - 1];
    return (lastRound.human === lastRound.ai) ? 'C' : 'D';
  },
  grudger: (history) => history.some(round => round.human === 'D') ? 'D' : 'C'
};

const payoff = {
  CC: [3, 3],
  CD: [0, 5],
  DC: [5, 0],
  DD: [1, 1]
};

function PrisonersDilemmaGame() {
  const [gameState, setGameState] = useState({ humanScore: 0, aiScore: 0, round: 0, history: [] });
  const [aiStrategy, setAiStrategy] = useState('titForTat');
  const chartRef = useRef();

  useEffect(() => {
    updateChart();
  }, [gameState]);

  const handleMove = (move) => {
    const aiMove = strategies[aiStrategy](gameState.history);
    const outcome = move + aiMove;
    const [humanPoints, aiPoints] = payoff[outcome];

    setGameState(prevState => ({
      humanScore: prevState.humanScore + humanPoints,
      aiScore: prevState.aiScore + aiPoints,
      round: prevState.round + 1,
      history: [...prevState.history, { human: move, ai: aiMove, humanScore: prevState.humanScore + humanPoints, aiScore: prevState.aiScore + aiPoints }]
    }));
  };

  const updateChart = () => {
    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.score));

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    x.domain([0, gameState.history.length - 1]);
    y.domain([0, d3.max(gameState.history, d => Math.max(d.humanScore, d.aiScore))]);

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    g.append("path")
      .datum(gameState.history.map((d, i) => ({ score: d.humanScore })))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);

    g.append("path")
      .datum(gameState.history.map((d, i) => ({ score: d.aiScore })))
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  };

  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h4">Prisoner's Dilemma: Human vs AI</Typography>
      <Select value={aiStrategy} onChange={(e) => setAiStrategy(e.target.value)}>
        <MenuItem value="titForTat">Tit for Tat</MenuItem>
        <MenuItem value="alwaysCooperate">Always Cooperate</MenuItem>
        <MenuItem value="alwaysDefect">Always Defect</MenuItem>
        <MenuItem value="random">Random</MenuItem>
        <MenuItem value="pavlov">Pavlov</MenuItem>
        <MenuItem value="grudger">Grudger</MenuItem>
      </Select>
      <Button onClick={() => handleMove('C')}>Cooperate</Button>
      <Button onClick={() => handleMove('D')}>Defect</Button>
      <Typography>Round: {gameState.round}</Typography>
      <Typography>Your Score: {gameState.humanScore}</Typography>
      <Typography>AI Score: {gameState.aiScore}</Typography>
      <svg ref={chartRef} width="600" height="400"></svg>
    </Paper>
  );
}

export default PrisonersDilemmaGame;