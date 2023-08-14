// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Api Hook Import
import { API_URL } from 'src/configs'

let paramsFilteredMails = []

// ** All Emails
export const fetchAllMails = createAsyncThunk('appEmail/fetchAllMails', async () => {
  const response = await axios.get(`${API_URL}/mails`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
    }
  })
  const { data } = response.data
  return { data }
})

// ** Fetch Mails
export const fetchMails = createAsyncThunk('appEmail/fetchMails', async params => {
  const { q = '', folder = 'inbox', label } = params
  const queryLowered = q.toLowerCase()

  const response = await axios.get(`${API_URL}/mails`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
    }
  })
  const { data } = response
  function isInFolder(email) {
    const emailFolder = email.folder.toLowerCase()
    if (folder === 'trash') return emailFolder === 'trash'
    if (folder === 'starred') return email.is_starred && emailFolder !== 'trash'

    return emailFolder === (folder || emailFolder) && emailFolder !== 'trash'
  }

  const filteredData = data.data.filter(
    email =>
      (email.from.name.toLowerCase().includes(queryLowered) ||
        email.subject.toLowerCase().includes(queryLowered) ||
        email.message.toLowerCase().includes(queryLowered)) &&
      isInFolder(email) &&
      (label ? email.labels.includes(label) : true)
  )

  paramsFilteredMails = filteredData

  // ------------------------------------------------
  // Email Meta
  // ------------------------------------------------
  const emailsMeta = {
    inbox: data.data.filter(email => !email.is_read && email.folder === 'INBOX').length,
    draft: data.data.filter(email => email.folder === 'DRAFT').length,
    spam: data.data.filter(email => !email.is_read && email.folder === 'SPAM').length
  }

  return { emails: filteredData, emailsMeta, filter: params }
})

// ** Get Current Mail
export const getCurrentMail = createAsyncThunk('appEmail/selectMail', async id => {
  const mail = paramsFilteredMails.find(i => i.id === id)
  if (mail) {
    const mailIndex = paramsFilteredMails.findIndex(i => i.id === mail.id)
    mailIndex > 0 ? (mail.hasPreviousMail = true) : (mail.hasPreviousMail = false)
    mailIndex < paramsFilteredMails.length - 1 ? (mail.hasNextMail = true) : (mail.hasNextMail = false)
  }
  console.log('Passed')
  console.log(mail ? [200, mail] : [404])
  return mail ? [200, mail] : [404]
})

// ** Create Mail
export const createMail = createAsyncThunk('appEmail/createMail', async params => {
  const response = await axios.post(`${API_URL}/mails`, params, {
    withCredentials: true,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`,
      'Content-Type': 'multipart/form-data'
    }
  })
  return response.data
})

// ** Update Mail
export const updateMail = createAsyncThunk('appEmail/updateMail', async (params, { dispatch, getState }) => {
  console.log(params.emailIds, params.dataToUpdate)
  return
  // const response = await axios.post(
  //   '/apps/email/update-emails',
  //   {
  //     data: { emailIds: params.emailIds, dataToUpdate: params.dataToUpdate }
  //   },
  //   {
  //     headers: {
  //       Accept: 'application/json',
  //       Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
  //       'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
  //     }
  //   }
  // )
  // await dispatch(fetchMails(getState().email.filter))
  // if (Array.isArray(params.emailIds)) {
  //   await dispatch(getCurrentMail(params.emailIds[0]))
  // }

  // return response.data
})

// ** Update Mail Folder
export const updateMailFolder = createAsyncThunk(
  'appEmail/updateMailFolder',
  async (params, { dispatch, getState }) => {
    const response = await axios.post(
      `${API_URL}/mail-folders`,
      {
        mail_ids: params.emailIds,
        folder: params.folder
      },
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
          'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
        }
      }
    )
    await dispatch(fetchMails(getState().email.filter))
    if (Array.isArray(params.emailIds)) {
      await dispatch(getCurrentMail(params.emailIds[0]))
    }

    return response.data
  }
)

// ** Update Mail Label
export const updateMailLabel = createAsyncThunk('appEmail/updateMailLabel', async (params, { dispatch, getState }) => {
  console.log('Fired')
  const response = await axios.patch(
    `${API_URL}/mail-labels`,
    {
      mail_ids: params.emailIds,
      label: params.label.toUpperCase()
    },
    {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
        'X-Refresh-Token': `Bearer ${window.localStorage.getItem('refreshToken')}`
      }
    }
  )

  await dispatch(fetchMails(getState().email.filter))
  if (Array.isArray(params.emailIds)) {
    await dispatch(getCurrentMail(params.emailIds[0]))
  }
  return response.data
})

export const resetParamsFilteredMails = () => {
  paramsFilteredMails = []
}

// ** Prev/Next Mails
export const paginateMail = createAsyncThunk('appEmail/paginateMail', async params => {
  const { dir, emailId } = params
  const currentEmailIndex = paramsFilteredMails.findIndex(e => e.id === emailId)
  const newEmailIndex = dir === 'previous' ? currentEmailIndex - 1 : currentEmailIndex + 1
  const newEmail = paramsFilteredMails[newEmailIndex]
  if (newEmail) {
    const mailIndex = paramsFilteredMails.findIndex(i => i.id === newEmail.id)
    mailIndex > 0 ? (newEmail.hasPreviousMail = true) : (newEmail.hasPreviousMail = false)
    mailIndex < paramsFilteredMails.length - 1 ? (newEmail.hasNextMail = true) : (newEmail.hasNextMail = false)
  }

  return newEmail ? [200, newEmail] : [404]
})

export const appEmailSlice = createSlice({
  name: 'appEmail',
  initialState: {
    mails: null,
    mailMeta: null,
    filter: {
      q: '',
      label: '',
      folder: 'inbox'
    },
    currentMail: null,
    selectedMails: []
  },
  reducers: {
    handleSelectMail: (state, action) => {
      const mails = state.selectedMails
      if (!mails.includes(action.payload)) {
        mails.push(action.payload)
      } else {
        mails.splice(mails.indexOf(action.payload), 1)
      }
      state.selectedMails = mails
    },
    handleSelectAllMail: (state, action) => {
      const selectAllMails = []
      if (action.payload && state.mails !== null) {
        selectAllMails.length = 0

        // @ts-ignore
        state.mails.forEach(mail => selectAllMails.push(mail.id))
      } else {
        selectAllMails.length = 0
      }
      state.selectedMails = selectAllMails
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchMails.fulfilled, (state, action) => {
      state.mails = action.payload.emails
      state.filter = action.payload.filter
      state.mailMeta = action.payload.emailsMeta
    })
    builder.addCase(getCurrentMail.fulfilled, (state, action) => {
      state.currentMail = action.payload
    })
    builder.addCase(paginateMail.fulfilled, (state, action) => {
      state.currentMail = action.payload
    })
  }
})

export const { handleSelectMail, handleSelectAllMail } = appEmailSlice.actions

export default appEmailSlice.reducer
