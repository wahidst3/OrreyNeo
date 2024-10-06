import * as React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs() {
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', width: 500 }}>
      <AppBar position="static">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="secondary"
          textColor="inherit"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Astroids" {...a11yProps(0)} />
          <Tab label="Comets" {...a11yProps(1)} />
        
        </Tabs>
      </AppBar>
      <TabPanel value={value} index={0} dir={theme.direction}>
      <h3 style={{textAlign:"center"}}>99942 Apophis</h3>
<h3 style={{textAlign:"center"}}>101955 Bennu</h3>
<h3 style={{textAlign:"center"}}>1862 Apollo</h3>
<h3 style={{textAlign:"center"}}>162173 Ryugu</h3>
<h3 style={{textAlign:"center"}}>433 Eros</h3>
<h3 style={{textAlign:"center"}}>3200 Phaethon</h3>
<h3 style={{textAlign:"center"}}>4179 Toutatis</h3>
<h3 style={{textAlign:"center"}}>3122 Florence</h3>
<h3 style={{textAlign:"center"}}>99907 (1999 AN10)</h3>
<h3 style={{textAlign:"center"}}>29075 (1950 DA)</h3>

      </TabPanel>
      <TabPanel value={value} index={1} dir={theme.direction} >
      <h3 style={{textAlign:"center"}}>1P/Halley (Halley's Comet)</h3>
<h3 style={{textAlign:"center"}}>2P/Encke</h3>
<h3 style={{textAlign:"center"}}>109P/Swift-Tuttle</h3>
<h3 style={{textAlign:"center"}}>73P/Schwassmann-Wachmann</h3>
<h3 style={{textAlign:"center"}}>45P/Honda-Mrkos-Pajdušáková</h3>
<h3 style={{textAlign:"center"}}>55P/Tempel-Tuttle</h3>
<h3 style={{textAlign:"center"}}>21P/Giacobini-Zinner</h3>
<h3 style={{textAlign:"center"}}>C/2020 F3 (NEOWISE)</h3>
<h3 style={{textAlign:"center"}}>C/2006 P1 (McNaught)</h3>
<h3 style={{textAlign:"center"}}>C/2013 A1 (Siding Spring)</h3>

      </TabPanel>
     
    </Box>
  );
}
