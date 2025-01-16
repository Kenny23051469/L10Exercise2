import React, { useState, useEffect } from 'react';
import { SectionList, StatusBar, Text, TextInput, View } from 'react-native';
import styles from './styles'; // Import the stylesheet

const datasetId = "d_8b84c4ee58e3cfc0ece0d773c8ca6abc";
const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}&limit=250`;

const App = () => {
  const [mydata, setMydata] = useState([]);
  const [originalData, setOriginalData] = useState([]);

  useEffect(() => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then(myJson => {
        const records = myJson.result.records;
        groupDataByTown(records);
        setOriginalData(records);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const groupDataByTown = (data) => {
    const groupedData = data.reduce((sections, item) => {
      const town = item.town;
      const section = sections.find((s) => s.title === town);

      if (section) {
        section.data.push(item);
      } else {
        sections.push({ title: town, data: [item] });
      }

      return sections;
    }, []);

    setMydata(groupedData);
  };

  const FilterData = (text) => {
    if (text !== '') {
      let myFilteredData = originalData.filter((item) => {
        const townMatch = item.town && item.town.toLowerCase().includes(text.toLowerCase());
        const flatTypeMatch = item.flat_type && item.flat_type.toLowerCase().includes(text.toLowerCase());
  
        return townMatch || flatTypeMatch;
      });
      groupDataByTown(myFilteredData);
    } else {
      groupDataByTown(originalData);
    }
  };
  
  

  const renderItem = ({ item }) => (
    <View style={styles.listItem}>
      <Text style={styles.flatDetails}>
        {item.flat_type} - {item.flat_model}
      </Text>
      <Text style={styles.flatDetails}>
        {item.street_name}
      </Text>
      <Text style={styles.flatDetails}>
        Block {item.block}
      </Text>
      <Text style={styles.priceText}>${item.resale_price}</Text>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <StatusBar style={styles.statusBar} />
      <Text style={styles.title}>Singapore Resale Flat Prices</Text>
      <Text style={styles.subtitle}>(Jan 2017 Onwards)</Text>

      {/* Search by Town */}
      <Text style={styles.searchLabel}>Search by Town:</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={(text) => {
          FilterData(text);
        }}
        placeholder="Enter town name"
      />

      {/* Search by Flat Type */}
      <Text style={styles.searchLabel}>Search by Flat Type:</Text>
      <TextInput
        style={styles.searchInput}
        onChangeText={(text) => {
          FilterData(text);
        }}
        placeholder="Enter flat type"
      />

      <SectionList
        sections={mydata}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </View>
  );
};

export default App;
