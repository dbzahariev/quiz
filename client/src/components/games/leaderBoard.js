import React, { useState, useEffect } from 'react'
import axios from "axios"
import { Table } from 'antd';

export default function LeaderBoard(props) {
  const [points, setPoints] = useState([{ name: "" }])
  const [users, setUsers] = useState([""])
  const [page, setPage] = useState(1)


  useEffect(() => {
    // fetchUserPoints()
    // fetchAllPoints()
    fetchUserNames()
    // eslint-disable-next-line
  }, [])

  const fetchUserNames = () => {
    axios.get(`/api/game/all?gameName=${props.game}`).then((el) => {
      let onlyUserNames = el.data.map((el2) => el2.nameHuman)
      setUsers(onlyUserNames)

      let newPoints = el.data
      setPoints(newPoints)
    })
  }

  // eslint-disable-next-line
  const fetchUserPoints = () => {
    let url = `/api/game/all?gameName=${props.game}`
    let user = getUser()
    if (user !== "") {
      url += `&nameHuman=${user}`
    }
    axios.get(url)
      .then((el) => {
        if (el.data[0] === undefined) {
          return [{}]
        }
        let allPOints = el.data[0].points
        allPOints = allPOints.map((el) => {
          return { ...el, number: el.id + 1, key: el.id }
        })
        // .sort((a, b) => {
        //   return b.score - a.score
        // }).slice(0, 3)
        setPoints(allPOints)
      })
      .catch(console.error)
  }

  const getUser = () => {
    // let res = "ramsess"
    let res = "ramsess"
    return res
  }

  // eslint-disable-next-line
  const rowPoints = (el, i) => {
    return <div className='point-row' key={el.id}>
      <p className="point-number">{`#: ${i + 1}`}</p>
      <p className="point-score">{`score: ${el.score}`}</p>
      <p className="point-time">{`time: ${el.time}`}</p>
    </div>
  }

  const returnNullContetn = () => {
    return <div className="leader-board"></div>
  }

  if (points[0].name === "") { return returnNullContetn() }
  if (users[0] === "") { return returnNullContetn() }

  const columns = [
    {
      title: "Number",
      render: (el, record, index, foo, vv) => {
        let kk = page * 10

        return <span>{(index + 1 + kk) - 10}</span>
      }
    },
    {
      title: "time",
      dataIndex: "time",
      sorter: (a, b) => a.time - b.time,
      defaultSortOrder: 'ascend',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      filters: users.map((el) => {
        return { text: el, value: el }
      }),
      // specify the condition of filtering result
      // here is that finding the name started with `value`
      onFilter: (value, record) => {
        return record.name === value
      },
      sorter: (a, b) => a.name.length - b.name.length,
      sortDirections: ['descend'],
    },
    {
      title: 'Score',
      dataIndex: 'score',
      sorter: (a, b) => a.score - b.score,
    },
  ];

  const retunDateToShow = () => {
    let res = []
    for (let i = 0; i < points.length; i++) {
      const oneUser = points[i];
      for (let j = 0; j < oneUser.points.length; j++) {
        const onePoint = oneUser.points[j];
        let oneRow = {
          name: oneUser.nameHuman,
          id: onePoint.id,
          key: res.length,
          score: onePoint.score,
          time: onePoint.time,
          number: res.length + 1,
        }
        res.push(oneRow)
      }
    }

    return res
  }

  return (
    <div className="leader-board">
      <p className='user-name'>{`Hello ${getUser()}`}</p>
      {/* {points.map(rowPoints)} */}

      <Table
        locale={{
          triggerDesc: null,
          triggerAsc: null,
          cancelSort: null
        }}
        pagination={{
          onChange: (page, ps) => {
            setPage(page)
          },
          current: page
        }}
        columns={columns} dataSource={retunDateToShow()}></Table>
    </div>
  )
}
