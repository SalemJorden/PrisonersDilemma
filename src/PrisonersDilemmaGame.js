import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, MenuItem, Typography, Paper, Grid, Box, Card, CardContent, CardActions } from '@material-ui/core';
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { blue, red, grey } from '@material-ui/core/colors';
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

const theme = createMuiTheme({
  palette: {
    primary: blue,
    secondary: red,
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
    backgroundColor: grey[100],
    minHeight: '100vh',
  },
  gameBoard: {
    height: 350,
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
  },
  playerCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  aiCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  button: {
    margin: theme.spacing(1),
  },
  select: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  scoreText: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    marginTop: theme.spacing(2),
  },
  roundText: {
    marginTop: theme.spacing(2),
    fontWeight: 'bold',
  },
}));

function PrisonersDilemmaGame() {
  const classes = useStyles();
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
    const width = svg.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 250 - margin.top - margin.bottom;
  
    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);
  
    const line = d3.line()
      .x((d, i) => x(i))
      .y(d => y(d.score))
      .curve(d3.curveMonotoneX);
  
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    x.domain([0, Math.max(gameState.history.length - 1, 1)]);
    y.domain([0, d3.max(gameState.history, d => Math.max(d.humanScore, d.aiScore)) || 10]);
  
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .append("text")
      .attr("fill", "#000")
      .attr("y", 25)
      .attr("x", width / 2)
      .attr("text-anchor", "middle")
      .text("Round");
  
    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Score");
  
    g.append("path")
      .datum(gameState.history.map((d, i) => ({ score: d.humanScore })))
      .attr("fill", "none")
      .attr("stroke", theme.palette.primary.main)
      .attr("stroke-width", 2)
      .attr("d", line);
  
    g.append("path")
      .datum(gameState.history.map((d, i) => ({ score: d.aiScore })))
      .attr("fill", "none")
      .attr("stroke", theme.palette.secondary.main)
      .attr("stroke-width", 2)
      .attr("d", line);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card className={classes.gameBoard}>
              <CardContent>
                <Typography variant="h4" align="center" gutterBottom>The Prisoner's Dilemma</Typography>
                <svg ref={chartRef} width="100%" height="250"></svg>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.playerCard}>
              <CardContent>
                <Typography variant="h5" component="h2">Player</Typography>
                <Typography className={classes.scoreText} color="primary">
                  Your Score: {gameState.humanScore}
                </Typography>
              </CardContent>
              <CardActions>
                <Button variant="contained" color="primary" className={classes.button} onClick={() => handleMove('C')}>
                  Cooperate
                </Button>
                <Button variant="contained" color="secondary" className={classes.button} onClick={() => handleMove('D')}>
                  Defect
                </Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card className={classes.aiCard}>
              <CardContent>
                <Typography variant="h5" component="h2">AI Strategy</Typography>
                <Select
                  value={aiStrategy}
                  onChange={(e) => setAiStrategy(e.target.value)}
                  fullWidth
                  className={classes.select}
                >
                  <MenuItem value="titForTat">Tit for Tat</MenuItem>
                  <MenuItem value="alwaysCooperate">Always Cooperate</MenuItem>
                  <MenuItem value="alwaysDefect">Always Defect</MenuItem>
                  <MenuItem value="random">Random</MenuItem>
                  <MenuItem value="pavlov">Pavlov</MenuItem>
                  <MenuItem value="grudger">Grudger</MenuItem>
                </Select>
                <Typography className={classes.scoreText} color="secondary">
                  AI Score: {gameState.aiScore}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="h6" align="center" className={classes.roundText}>
          Round: {gameState.round}
        </Typography>
      </div>
    </ThemeProvider>
  );
}

export default PrisonersDilemmaGame;