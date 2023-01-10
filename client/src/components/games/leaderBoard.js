import React, { useState, useEffect } from 'react'
import axios from "axios"
import { Table } from 'antd';
import { convertTime } from '../../gameColorCheck';

const getUserFromLS = () => {
  return sessionStorage.getItem("user") || `user-${`${getRandomInt()}${getRandomInt()}${getRandomInt()}`}`
}

function getRandomInt() {
  return Math.floor(Math.random() * 9);
}

export async function saveGameInDb(params) {
  let { score, hardMode, time } = params.data
  let gameName = params.system.game
  let userName = sessionStorage.getItem("user")

  let dataToSave = {
    nameHuman: userName,
    gameName: gameName,
    newPoint: {
      score: score,
      time: time,
      hardMode: hardMode
    }
  }

  let result = await axios.post("api/game/update", dataToSave)

  return result.data
}

export default function LeaderBoard(props) {
  const [points, setPoints] = useState([{ name: "" }])
  const [users, setUsers] = useState([""])
  const [page, setPage] = useState(1)
  const [user, setUser] = useState(getUserFromLS())

  useEffect(() => {
    if (getUserFromLS() !== user) {
      sessionStorage.setItem("user", user)
    }
  }, [user])

  useEffect(() => {
    fetchUserNames()
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (props.refreshLeaderBoard > 0) {
      fetchUserNames()
    }
    // eslint-disable-next-line
  }, [props.refreshLeaderBoard])

  const fetchUserNames = () => {
    axios.get(`/api/game/all?gameName=${props.game}`).then((el) => {
      let onlyUserNames = el.data.map((el2) => el2.nameHuman)
      setUsers(onlyUserNames)

      let newPoints = el.data
      setPoints(newPoints)
    })
  }

  const returnNullContent = () => {
    return <div className="leader-board">
      <div className="leader-board-nickname-div">
        <p id="welcome">Добре дошъл</p>
        <input type="text"
          onMouseLeave={() => {
            document.getElementById("welcome").focus()
          }}
          onChange={(el) => setUser(el.target.value)} value={user}
          id="userName" className="form-control-plaintext"
        >
        </input>
      </div>
    </div>
  }

  if (points[0] === undefined) { return returnNullContent() }
  if (points[0].name === "") { return returnNullContent() }
  if (users[0] === "") { return returnNullContent() }

  const returnHardMode = () => {
    let allHardMods = []

    points.forEach((el) => {
      el.points.forEach((el2) => {
        let hardModeToAdd = el2.hardMode
        if (!allHardMods.includes(hardModeToAdd)) allHardMods.push(hardModeToAdd)
      })
    })
    allHardMods = allHardMods.sort((a, b) => a - b).map((el) => { return { text: el, value: el } })

    return allHardMods
  }

  const columns = [
    {
      title: "№",
      render: (el, record, index) => <span>{(index + 1 + page * 10) - 10}</span>
    },
    {
      title: "Време",
      dataIndex: "time",
      // sorter: (a, b) => a.time - b.time,
      sorter: {
        compare: (a, b) => a.time - b.time,
        multiple: 1,
      },
      defaultSortOrder: 'descend', // ascend || descend
      render: (el) => {
        return convertTime(el * 100, false)
      }
    },
    {
      title: 'Акаунт',
      dataIndex: 'name',
      filters: users.map((el) => {
        return { text: el, value: el }
      }),
      // specify the condition of filtering result
      // here is that finding the name started with `value`
      onFilter: (value, record) => {
        return record.name === value
      },
      sortDirections: ['descend'],
    },
    {
      title: 'Точки',
      dataIndex: 'score',
      sorter: {
        compare: (a, b) => a.score - b.score,
        multiple: 2,
      },
    },
    {
      title: 'Труд.',
      dataIndex: 'hardMode',
      filters: returnHardMode(),
      onFilter: (value, record) => {
        return record.hardMode === value
      },
      sorter: {
        compare: (a, b) => a.hardMode - b.hardMode,
        multiple: 3,
      },
    },
    {
      title: "Дата и час",
      dataIndex: "date",
      render: (el) => {
        let result = new Intl.DateTimeFormat('bg-BG', { day: "2-digit", month: "narrow", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(el))
        return result
      }
    },
  ];

  const returnDateToShow = () => {
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
          hardMode: onePoint.hardMode,
          date: onePoint.date
        }
        res.push(oneRow)
      }
    }

    return res
  }

  return (
    <div className="leader-board">
      <div className="leader-board-nickname-div">
        <p id="welcome">Добре дошъл</p>
        <input type="text"
          onMouseLeave={() => {
            document.getElementById("welcome").focus()
          }}
          onChange={(el) => setUser(el.target.value)} value={user}
          id="userName" className="form-control-plaintext"
        >
        </input>
      </div>
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
        columns={columns} dataSource={returnDateToShow()}></Table>
    </div>
  )
}
