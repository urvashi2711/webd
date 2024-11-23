import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import accounts from './Account'; 
import calls from './Calls'; 

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale);

export default function Home() {
  const [selectedUser, setSelectedUser] = useState('Select User');
  const [chartData, setChartData] = useState({}); 
  const [filteredCalls, setFilteredCalls] = useState(calls);
  const [filteredAccounts, setFilteredAccounts] = useState(accounts); 
  const [currentPage, setCurrentPage] = useState(1); 
  const [currentPageOtherDetails, setCurrentPageOtherDetails] = useState(1); 
  const [itemsPerPage] = useState(5); 
  const [showOtherDetails, setShowOtherDetails] = useState(false); 

  const users = ['User1', 'User2', 'User3']; 

  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, startIndex + itemsPerPage);

  const totalPagesOtherDetails = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndexOtherDetails = (currentPageOtherDetails - 1) * itemsPerPage;
  const currentCalls = filteredCalls.slice(startIndexOtherDetails, startIndexOtherDetails + itemsPerPage);

  const handleUserChange = (e) => setSelectedUser(e.target.value);
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  
  const handleNextPageOtherDetails = () => setCurrentPageOtherDetails((prev) => Math.min(prev + 1, totalPagesOtherDetails));
  const handlePreviousPageOtherDetails = () => setCurrentPageOtherDetails((prev) => Math.max(prev - 1, 1));


  const handlePieClick = (e, chart) => {
    const clickedIndex = chart[0].index;
    const selectedCallType = chartData.labels[clickedIndex];

    
    const filtered = calls.filter((call) => call.callType === selectedCallType);
    setFilteredCalls(filtered);

  
    const filteredAccountsForType = accounts.filter((account) =>
      filtered.some((call) => call.accountId === account.id) 
    );
    setFilteredAccounts(filteredAccountsForType);
  };

  useEffect(() => {
    
    const callCounts = calls.reduce((acc, call) => {
      acc[call.callType] = (acc[call.callType] || 0) + 1;
      return acc;
    }, {});

    const types = Object.keys(callCounts);
    const counts = Object.values(callCounts);

    setChartData({
      labels: types,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#2365b0', 
            '#418cd2',
            '#67afe1',
            '#91ccf3', 
            '#0055a3', 
          ],
          hoverBackgroundColor: [
            '#2365b0', 
            '#418cd2',
            '#67afe1', 
            '#91ccf3', 
            '#0055a3', 
          ],
        },
      ],
    });
  }, []);

  
  const getAccountNameById = (accountId) => {
    const account = accounts.find((acc) => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };


  const getAccountDetails = (accountId) => {
    const accountCalls = calls.filter((call) => call.accountId === accountId);
    
    
    const totalCalls = accountCalls.filter((call) => call.callType === 'Phone').length;
    const totalEmails = accountCalls.filter((call) => call.callType === 'Email').length;

  
    const latestCallDate = accountCalls
      .filter((call) => call.callType === 'Phone')
      .sort((a, b) => new Date(b.callDate) - new Date(a.callDate))[0]?.callDate;

    const latestEmailDate = accountCalls
      .filter((call) => call.callType === 'Email')
      .sort((a, b) => new Date(b.callDate) - new Date(a.callDate))[0]?.callDate;

    return {
      totalCalls,
      totalEmails,
      latestCallDate: latestCallDate ? new Date(latestCallDate).toLocaleDateString() : 'N/A',
      latestEmailDate: latestEmailDate ? new Date(latestEmailDate).toLocaleDateString() : 'N/A',
    };
  };


  useEffect(() => {
    if (selectedUser !== 'Select User') {
      const userAccounts = accounts.filter((account) => account.owner === selectedUser);
      setFilteredAccounts(userAccounts);
    }
  }, [selectedUser]);

  return (
    <div>
     
      <header className="navbar">
        <div className="navbar-user-dropdown">
          <select
            value={selectedUser}
            onChange={handleUserChange}
            className="user-dropdown"
          >
            <option value="Select User">Select User</option>
            {users.map((user, index) => (
              <option key={index} value={user}>
                {user}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="container">
        <div className="row" style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        
          <div
            className="chart-container"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <h2
              style={{
                textAlign: 'center',
                margin: '0 0 20px',
                fontSize: '1.5em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              Call Distribution
            </h2>
          
            {chartData.labels && chartData.labels.length > 0 ? (
              <Pie
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  onClick: handlePieClick, 
                }}
                height={200}
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#888' }}>Loading chart...</div>
            )}
          </div>

        
          <div
            className={`other-details ${showOtherDetails ? 'show' : 'hide'}`}
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'max-height 0.3s ease-in-out',
              maxHeight: showOtherDetails ? '1000px' : '0',
              overflow: 'hidden',
            }}
          >
            <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.3em' }}>
              Other Details
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Call ID</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Account Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Call Date</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Call Status</th>
                </tr>
              </thead>
              <tbody>
                {currentCalls.length > 0 ? (
                  currentCalls.map((call, index) => (
                    <tr
                      key={call.id}
                      style={{
                        background: index % 2 === 0 ? '#fff' : '#f9f9f9',
                        borderBottom: '1px solid #ddd',
                      }}
                    >
                      <td style={{ padding: '10px' }}>{call.id}</td>
                      <td style={{ padding: '10px' }}>{getAccountNameById(call.accountId)}</td>
                      <td style={{ padding: '10px' }}>{new Date(call.callDate).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>{call.callStatus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center' }}>
                      No calls available for this type
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={handlePreviousPageOtherDetails}>Previous</button>
              <span className="page-info">
                {currentPageOtherDetails} / {totalPagesOtherDetails}
              </span>
              <button onClick={handleNextPageOtherDetails}>Next</button>
            </div>
          </div>
        </div>

       
        <button onClick={() => setShowOtherDetails(!showOtherDetails)} style={{ margin: '20px 0' }}>
          {showOtherDetails ? 'Hide Other Details' : 'Show Other Details'}
        </button>

       
        <div className="row">
          <div className="column full">
            <h3>User's Territory Account Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Account Name</th>
                  <th>Total Calls</th>
                  <th>Total Emails</th>
                  <th>Latest Call Date</th>
                  <th>Latest Email Date</th>
                </tr>
              </thead>
              <tbody>
                {currentAccounts.length > 0 ? (
                  currentAccounts.map((account, index) => {
                    const { totalCalls, totalEmails, latestCallDate, latestEmailDate } = getAccountDetails(account.id);
                    return (
                      <tr key={index}>
                        <td>{account.name}</td>
                        <td>{totalCalls}</td>
                        <td>{totalEmails}</td>
                        <td>{latestCallDate}</td>
                        <td>{latestEmailDate}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">No accounts available</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="pagination">
              <button onClick={handlePreviousPage}>Previous</button>
              <span className="page-info">
                {currentPage} / {totalPages}
              </span>
              <button onClick={handleNextPage}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
