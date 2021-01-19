import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import Countup from 'react-countup';
import Card from './Card';
import ClipLoader from 'react-spinners/ClipLoader';

const Contents = () => {
  const [confirmedData, setConfirmedData] = useState({});
  const [qurantedData, setQurantedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [totalConfirmed, setTotalConfirmed] = useState(0);
  const [totalRecoverd, setTotalRecoverd] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [newConfirmed, setNewConfirmed] = useState(0);
  const [newRecoverd, setNewRecoverd] = useState(0);
  const [newDeaths, setNewDeaths] = useState(0);
  const [covidSummary, setCovidSummary] = useState({});
  const [country, setCountry] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchedEvents = async () => {
      const response = await axios.get(`https://api.covid19api.com/summary`);
      setLoading(false);
      setCovidSummary(response.data);
      setTotalConfirmed(response.data.Global.TotalConfirmed);
      setTotalRecoverd(response.data.Global.TotalRecovered);
      setTotalDeaths(response.data.Global.TotalDeaths);
      setNewConfirmed(response.data.Global.NewConfirmed);
      setNewRecoverd(response.data.Global.NewRecovered);
      setNewDeaths(response.data.Global.NewDeaths);
      console.log(response.data);
    };

    fetchedEvents();
  }, []);
  const changeHandler = (e) => {
    setCountry(e.target.value);
    getCoronaReport(e.target.value);
  };

  const getCoronaReport = (countrySlug) => {
    setLoading(true);
    axios
      .get(`https://api.covid19api.com/total/dayone/country/${countrySlug}`)
      .then((res) => {
        setLoading(false);
        makeData(res.data);
        const covidDetails = covidSummary.Countries.find(
          (country) => country.Slug === countrySlug
        );
        setNewConfirmed(covidDetails.NewConfirmed);
        setNewRecoverd(covidDetails.NewRecovered);
        setNewDeaths(covidDetails.NewDeaths);

        console.log(covidDetails);
      });

    const makeData = (items) => {
      const arr = items.reduce((acc, cur) => {
        const currentDate = new Date(cur.Date);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const date = currentDate.getDate();
        const active = cur.Active;
        const confirmed = cur.Confirmed;
        const deaths = cur.Deaths;
        const recovered = cur.Recovered;

        setTotalConfirmed(confirmed);
        setTotalRecoverd(recovered);
        setTotalDeaths(deaths);

        const labels = ['확진자', '격리해제', '사망자'];

        setConfirmedData({
          labels,
          datasets: [
            {
              label: 'People',
              backgroundColor: [
                'rgba(255, 0, 0, 0.5)',
                'rgba(0, 255, 0, 0.5)',
                'rgba(59, 58, 58, 0.5)',
              ],
              fill: true,
              maxBarThickness: 12,
              data: [confirmed, recovered, deaths],
            },
          ],
        });

        const findItem = acc.find((a) => a.year === year && a.month === month);
        if (!findItem) {
          acc.push({
            year,
            month,
            date,
            confirmed,
            active,
            deaths,
            recovered,
          });
        }
        if (findItem && findItem.date < date) {
          findItem.active = active;
          findItem.deaths = deaths;
          findItem.recovered = recovered;
          findItem.confirmed = confirmed;
          findItem.year = year;
          findItem.month = month;
          findItem.date = date;
        }

        return acc;
      }, []);
      console.log(arr);
      const labels = arr.map((a) => `${a.month + 1}월`);

      setQurantedData({
        labels,
        datasets: [
          {
            label: '격리자 현황',
            borderColor: 'rgba(0, 47, 255, 0.5)',
            pointHoverBackgroundColor: 'white',
            pointBorderWidth: 3,
            borderWidth: 1,
            fill: false,
            data: arr.map((a) => a.active),
          },
          {
            label: '사망자 현황',
            borderColor: 'rgba(59, 58, 58, 0.5)',
            pointHoverBackgroundColor: 'white',
            pointBorderWidth: 3,
            borderWidth: 1,
            fill: false,
            data: arr.map((a) => a.deaths),
          },
        ],
      });
    };
  };
  return (
    <section className="section">
      <h2>
        {country === ''
          ? '전세계 누적 확진자 현황 '
          : `${country.toUpperCase()} 확진자 현황`}
      </h2>
      <h3>{`${new Date().getFullYear()}년 ${
        new Date().getMonth() + 1
      }월 ${new Date().getDate()}일`}</h3>

      <div className="containcard">
        <Card>
          <div className="card1">
            <span className="title">총 확진자수</span>
            <br />
            <Countup
              start={0}
              end={totalConfirmed}
              duration={7}
              separator=","
            />
            <br />
            <span className="sub-title">신규 확진자수</span>
            <br />
            <Countup start={0} end={newConfirmed} duration={7} separator="," />
          </div>
        </Card>
        <Card>
          <div className="card2">
            <span className="title">격리해제</span>
            <br />
            <Countup start={0} end={totalRecoverd} duration={7} separator="," />
            <br />
            <span className="sub-title">신규 격리해제</span>
            <br />
            <Countup start={0} end={newRecoverd} duration={7} separator="," />
          </div>
        </Card>
        <Card>
          <div className="card3">
            <span className="title">사망자수</span>
            <br />
            <Countup start={0} end={totalDeaths} duration={7} separator="," />
            <br />
            <span className="sub-title">신규 사망자수</span>
            <br />
            <Countup start={0} end={newDeaths} duration={7} separator="," />
          </div>
        </Card>
      </div>

      <div className="select">
        <select value={country} onChange={changeHandler}>
          <option value="">국가를 선택하세요</option>
          <option value={'korea-south'}>국내</option>
          {covidSummary.Countries &&
            covidSummary.Countries.map((country) => (
              <option key={country.Slug} value={country.Slug}>
                {country.Country}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <ClipLoader color={'#1f1f1f'} loading={loading} size={40} />
        </div>
      ) : (
        <div className="contents">
          <div className="content" style={{ height: '30vh', width: '50vh' }}>
            <Bar
              data={confirmedData}
              options={{
                maintainAspectRatio: false,

                legend: { display: true, position: 'top' },

                animation: {
                  duration: 2000,
                },
              }}
            />

            <Line
              data={qurantedData}
              options={{
                maintainAspectRatio: false,
                title: {
                  display: true,
                  text: '격리자 사망자 현황',
                  fontSize: 12,
                  fontFamily: 'Noto Sans KR',
                },
                legend: { display: true, position: 'top' },
                animation: {
                  duration: 2000,
                },
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Contents;
