import React from 'react';
import { Box, Typography } from '@mui/material';

const StatusTile = ({ icon: Icon, title, status, accent }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      px: 2.4,
      py: 2.1,
      borderRadius: '18px',
      position: 'relative',
      border: `1px solid ${accent.border}`,
      background: accent.tint,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 36,
        height: 36,
        borderRadius: '12px',
        background: accent.iconBg,
        color: accent.iconColor,
      }}
    >
      <Icon fontSize="small" />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(226, 232, 240, 0.68)' }}>
        {title}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f8fafc' }} noWrap>
        {status}
      </Typography>
    </Box>
  </Box>
);

export default StatusTile;
