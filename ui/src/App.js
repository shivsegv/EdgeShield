import React, { useMemo, useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { ThemeProvider, alpha, createTheme } from '@mui/material/styles';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ShieldMoonRoundedIcon from '@mui/icons-material/ShieldMoonRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import RadarRoundedIcon from '@mui/icons-material/RadarRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import './App.css';
import MetricCard from './components/MetricCard';
import StatusTile from './components/StatusTile';
import InsightRow from './components/InsightRow';
import NetworkMomentumCard from './components/NetworkMomentumCard';
import TrafficSplitCard from './components/TrafficSplitCard';
import useEvents from './hooks/useEvents';
import useEventFilters from './hooks/useEventFilters';
import useEventInsights from './hooks/useEventInsights';
import { STATUS_ACCENTS } from './constants/status';
import { formatRelativeTime } from './utils/format';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#60a5fa',
    },
    secondary: {
      main: '#a855f7',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(15, 23, 42, 0.85)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    h2: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          backgroundImage: 'linear-gradient(135deg, rgba(148, 163, 184, 0.12) 0%, rgba(15, 118, 255, 0.08) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(148, 163, 184, 0.12)',
        },
      },
    },
  },
});

function App() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { events, isLoading, error, lastUpdated, refresh } = useEvents(autoRefresh);
  const { sortedEvents } = useEventFilters(events, decisionFilter, searchTerm);
  const {
    totals,
    topPaths,
    topApiKeys,
    topMethods,
    blockedReasons,
    timelineData,
    velocityStats,
    uniqueApiKeys,
    lastTelemetryEvent,
    allowFresh,
    ingestFresh,
    pressureDescriptor,
    allowRate,
    chartData,
  } = useEventInsights(events, sortedEvents);

  const velocityLabel = timelineData.length ? `${velocityStats.latest.toLocaleString()} / min` : '—';
  const velocityHelper = timelineData.length
    ? `Avg ${velocityStats.average.toLocaleString()} • Peak ${velocityStats.peak.toLocaleString()}`
    : 'Awaiting live samples';

  const heroStatuses = useMemo(
    () => [
      {
        icon: DnsRoundedIcon,
        title: 'Edge Proxy',
        status: ingestFresh
          ? `Streaming • ${lastTelemetryEvent ? formatRelativeTime(lastTelemetryEvent) : 'live seconds ago'}`
          : 'Awaiting telemetry',
        accent: STATUS_ACCENTS.emerald,
      },
      {
        icon: DataObjectRoundedIcon,
        title: 'Ingest Pipeline',
        status: error ? 'Degraded · retrying' : `Accepting batches · ${totals.total.toLocaleString()} events`,
        accent: error ? STATUS_ACCENTS.rose : STATUS_ACCENTS.sky,
      },
      {
        icon: PublicRoundedIcon,
        title: 'Demo Backend',
        status: allowFresh ? 'Serving clean traffic' : 'Standing by for requests',
        accent: STATUS_ACCENTS.violet,
      },
    ],
    [allowFresh, error, ingestFresh, lastTelemetryEvent, totals.total],
  );

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box className="App">
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            borderBottom: '1px solid rgba(148, 163, 184, 0.12)',
            backgroundColor: 'rgba(15, 23, 42, 0.72)',
            backdropFilter: 'blur(18px)',
          }}
        >
          <Toolbar sx={{ py: 2 }}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: alpha(darkTheme.palette.primary.main, 0.2),
                color: darkTheme.palette.primary.light,
                mr: 2,
              }}
            >
              <SecurityRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Edge Rate Limiter
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                <AccessTimeRoundedIcon fontSize="inherit" />
                <Typography variant="caption">
                  Last update: {formatRelativeTime(lastUpdated)}
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={autoRefresh}
                  onChange={(event) => setAutoRefresh(event.target.checked)}
                  color="secondary"
                />
              }
              label="Auto refresh"
              sx={{ mr: 1 }}
            />
            <Tooltip title="Refresh now">
              <IconButton color="primary" onClick={refresh}>
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Toolbar>
          {isLoading && <LinearProgress color="secondary" />}
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 6 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '26px',
              px: { xs: 3, md: 5 },
              py: { xs: 4, md: 5 },
              mb: 5,
              border: '1px solid rgba(148, 163, 184, 0.14)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(30, 41, 59, 0.82) 100%)',
              boxShadow: '0 40px 120px -80px rgba(15, 23, 42, 0.9)',
            }}
          >
            <Stack spacing={3.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Chip
                  icon={<RadarRoundedIcon fontSize="small" />}
                  label={(
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#bfdbfe' }}>
                        {pressureDescriptor.label}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Live posture
                      </Typography>
                    </Box>
                  )}
                  sx={{
                    px: 1.4,
                    py: 1,
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.08)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#bfdbfe',
                  }}
                />
                <Chip
                  icon={<AccessTimeRoundedIcon fontSize="small" />}
                  label={`Synced ${formatRelativeTime(lastUpdated)}`}
                  sx={{
                    px: 1.4,
                    py: 1,
                    borderRadius: '12px',
                    background: 'rgba(94, 234, 212, 0.08)',
                    border: '1px solid rgba(94, 234, 212, 0.24)',
                    color: '#99f6e4',
                  }}
                />
              </Stack>
              <Stack spacing={2} sx={{ maxWidth: 720 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: '0.01em' }}>
                  Edge Operations Console
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Real-time telemetry across rate limits, ingest health, and application flow, structured for confident,
                  human-led decisions.
                </Typography>
              </Stack>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
                {heroStatuses.map(({ icon, title, status, accent }) => (
                  <StatusTile key={title} icon={icon} title={title} status={status} accent={accent} />
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                icon={ShieldMoonRoundedIcon}
                title="Total Requests"
                value={totals.total.toLocaleString()}
                helper={`${totals.uniqueIPs} unique source IPs`}
                accent="rgba(94, 234, 212, 0.9)"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                icon={CheckCircleRoundedIcon}
                title="Allowed"
                value={totals.allowed.toLocaleString()}
                helper={`Allow rate ${allowRate}%`}
                accent="rgba(74, 222, 128, 0.9)"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                icon={BlockRoundedIcon}
                title="Blocked"
                value={totals.blocked.toLocaleString()}
                helper={`Block share ${totals.blockedRate}`}
                accent="rgba(248, 113, 113, 0.9)"
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <MetricCard
                icon={BoltRoundedIcon}
                title="Velocity"
                value={velocityLabel}
                helper={velocityHelper}
                accent="rgba(96, 165, 250, 0.9)"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} lg={7}>
              <NetworkMomentumCard timelineData={timelineData} velocityStats={velocityStats} />
            </Grid>
            <Grid item xs={12} lg={5}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2.5 }}>
                    Operational Insights
                  </Typography>
                  <Stack spacing={2.2}>
                    <InsightRow
                      icon={InsightsRoundedIcon}
                      label="Traffic posture"
                      value={pressureDescriptor.label}
                      helper={pressureDescriptor.helper}
                    />
                    <InsightRow
                      icon={RadarRoundedIcon}
                      label="Allow ratio"
                      value={`${allowRate}%`}
                      helper="Across the current sample window"
                    />
                    <InsightRow
                      icon={PublicRoundedIcon}
                      label="Active API keys"
                      value={uniqueApiKeys.toLocaleString()}
                      helper="Unique credentials observed in this window"
                    />
                  </Stack>
                  <Divider sx={{ my: 3 }} />
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Chip
                      size="small"
                      icon={<AccessTimeRoundedIcon fontSize="small" />}
                      label={
                        lastTelemetryEvent
                          ? `Last event ${formatRelativeTime(lastTelemetryEvent)}`
                          : 'Awaiting first event'
                      }
                      sx={{
                        borderRadius: '12px',
                        background: 'rgba(148, 163, 184, 0.16)',
                        color: '#e2e8f0',
                      }}
                    />
                    <Chip
                      size="small"
                      icon={<SecurityRoundedIcon fontSize="small" />}
                      label={autoRefresh ? 'Auto refresh · on' : 'Auto refresh · paused'}
                      sx={{
                        borderRadius: '12px',
                        background: autoRefresh ? 'rgba(74, 222, 128, 0.18)' : 'rgba(248, 113, 113, 0.16)',
                        color: autoRefresh ? '#bbf7d0' : '#fecaca',
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6} lg={5}>
              <TrafficSplitCard chartData={chartData} allowRate={allowRate} totals={totals} />
            </Grid>

            <Grid item xs={12} md={6} lg={7}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Hotspots & Signals
                  </Typography>
                  <Grid container spacing={2.2}>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha('#60a5fa', 0.2), color: '#60a5fa' }}>
                            <RouteRoundedIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Top endpoints</Typography>
                        </Stack>
                        {topPaths.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            No requests observed yet.
                          </Typography>
                        )}
                        {topPaths.map(({ label, count }) => (
                          <Paper
                            key={label}
                            variant="outlined"
                            sx={{
                              p: 1.6,
                              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0) 100%)',
                              borderRadius: '16px',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                              <Typography variant="body2" sx={{ maxWidth: '75%' }} noWrap>
                                {label}
                              </Typography>
                              <Chip
                                label={`${count} hits`}
                                size="small"
                                sx={{ bgcolor: 'rgba(59, 130, 246, 0.16)', color: '#93c5fd', borderRadius: '10px' }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha('#f87171', 0.18), color: '#fca5a5' }}>
                            <VpnKeyRoundedIcon />
                          </Avatar>
                          <Typography variant="subtitle2">API keys under load</Typography>
                        </Stack>
                        {topApiKeys.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Awaiting telemetry...
                          </Typography>
                        )}
                        {topApiKeys.map(({ label, count }) => (
                          <Paper
                            key={label}
                            variant="outlined"
                            sx={{
                              p: 1.6,
                              background: 'linear-gradient(135deg, rgba(248, 113, 113, 0.12) 0%, rgba(248, 113, 113, 0) 100%)',
                              borderRadius: '16px',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                              <Typography variant="body2" sx={{ maxWidth: '75%' }} noWrap>
                                {label}
                              </Typography>
                              <Chip
                                label={`${count} calls`}
                                size="small"
                                sx={{ bgcolor: 'rgba(248, 113, 113, 0.16)', color: '#fecaca', borderRadius: '10px' }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ bgcolor: alpha('#a855f7', 0.18), color: '#d8b4fe' }}>
                            <BoltRoundedIcon />
                          </Avatar>
                          <Typography variant="subtitle2">Dominant methods</Typography>
                        </Stack>
                        {topMethods.length === 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Method mix not detected yet.
                          </Typography>
                        )}
                        {topMethods.map(({ label, count }) => (
                          <Paper
                            key={label}
                            variant="outlined"
                            sx={{
                              p: 1.6,
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0) 100%)',
                              borderRadius: '16px',
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                              <Typography variant="body2" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                                {label}
                              </Typography>
                              <Chip
                                label={`${count} reqs`}
                                size="small"
                                sx={{ bgcolor: 'rgba(168, 85, 247, 0.16)', color: '#d8b4fe', borderRadius: '10px' }}
                              />
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <Stack spacing={1.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ bgcolor: alpha('#fbbf24', 0.18), color: '#facc15' }}>
                        <FilterAltRoundedIcon />
                      </Avatar>
                      <Typography variant="subtitle2">Most common block reasons</Typography>
                    </Stack>
                    {blockedReasons.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No mitigations triggered in this window.
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {blockedReasons.map(({ label, count }) => (
                        <Chip
                          key={label}
                          label={`${label} (${count})`}
                          sx={{
                            bgcolor: alpha('#fbbf24', 0.18),
                            color: '#fde68a',
                            borderRadius: '12px',
                            mb: 1,
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5 }}>
            <Paper sx={{ p: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }}>
                <Typography variant="h6">Live Event Stream</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                  <TextField
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    size="small"
                    placeholder="Search IP, key, reason..."
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" sx={{ opacity: 0.8 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label="All"
                      variant={decisionFilter === 'all' ? 'filled' : 'outlined'}
                      color={decisionFilter === 'all' ? 'primary' : 'default'}
                      onClick={() => setDecisionFilter('all')}
                    />
                    <Chip
                      label="Allowed"
                      variant={decisionFilter === 'allowed' ? 'filled' : 'outlined'}
                      color={decisionFilter === 'allowed' ? 'success' : 'default'}
                      onClick={() => setDecisionFilter('allowed')}
                    />
                    <Chip
                      label="Blocked"
                      variant={decisionFilter === 'blocked' ? 'filled' : 'outlined'}
                      color={decisionFilter === 'blocked' ? 'error' : 'default'}
                      onClick={() => setDecisionFilter('blocked')}
                    />
                  </Stack>
                </Stack>
              </Stack>

              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}

              <TableContainer sx={{ mt: 3, maxHeight: 460 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>IP</TableCell>
                      <TableCell>API key</TableCell>
                      <TableCell>Endpoint</TableCell>
                      <TableCell align="center">Method</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Decision</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>User agent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedEvents.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Waiting for telemetry...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {sortedEvents.map((event) => {
                      const isBlocked = event.decision === 'blocked';
                      return (
                        <TableRow
                          key={`${event.timestamp}-${event.client_ip}-${event.path}`}
                          hover
                          sx={{
                            position: 'relative',
                            '&:last-child td, &:last-child th': { border: 0 },
                            background: isBlocked ? alpha('#f87171', 0.08) : alpha('#1e3a8a', 0.04),
                            borderBottom: '1px solid rgba(148, 163, 184, 0.08)',
                            transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
                            '&:hover': {
                              background: isBlocked ? alpha('#f87171', 0.12) : alpha('#1d4ed8', 0.1),
                              boxShadow: '0 14px 48px -32px rgba(59, 130, 246, 0.65)',
                              transform: 'translateY(-1px)',
                            },
                          }}
                        >
                          <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                          <TableCell>{event.client_ip || '—'}</TableCell>
                          <TableCell>{event.api_key || '—'}</TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 220,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.path || '—'}
                          </TableCell>
                          <TableCell align="center">{event.method || '—'}</TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={event.status ?? '—'}
                              sx={{
                                borderRadius: '10px',
                                background: 'rgba(59, 130, 246, 0.16)',
                                color: '#bfdbfe',
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={event.decision}
                              sx={{
                                borderRadius: '10px',
                                background: isBlocked ? 'rgba(248, 113, 113, 0.18)' : 'rgba(74, 222, 128, 0.18)',
                                color: isBlocked ? '#fecaca' : '#bbf7d0',
                                border: '1px solid rgba(148, 163, 184, 0.12)',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 240,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.reason || '—'}
                          </TableCell>
                          <TableCell
                            sx={{
                              maxWidth: 320,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {event.fingerprint?.ua || '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
