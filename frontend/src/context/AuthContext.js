// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'
import { API_URL } from 'src/configs'

import { useApi } from 'src/hooks'

// ** Socket io Import
import { connect } from 'socket.io-client'

import { resetParamsFilteredMails } from 'src/store/apps/email'

// ** Defaults
const auth = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLogged: false,
  loading: false,
  setUser: () => null,
  setLoading: () => Boolean,
  register: () => Promise.resolve(),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(auth)

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(auth.user && JSON.parse(auth.user))
  const [accessToken, setAccessToken] = useState(null)
  const [refreshToken, setRefreshToken] = useState(null)
  const [loading, setLoading] = useState(auth.loading)
  const [isLogged, setIsLogged] = useState(auth.isLogged)
  const { get, post } = useApi()
  const socket = connect(API_URL)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = window.localStorage.getItem('accessToken')
        if (accessToken) {
          setLoading(true)
          const response = await get(authConfig.authMeEndpoint)
          const { user, accessToken } = response.data
          if (accessToken) {
            window.localStorage.setItem('user', JSON.stringify(user))
            window.localStorage.setItem('accessToken', accessToken)
          }
          setLoading(false)
          setUser(user)
          setAccessToken(accessToken)
          setIsLogged(true)
        }
      } catch {
        // Remove user data from localStorage
        window.localStorage.removeItem('user')
        // Remove accessToken from localStorage
        window.localStorage.removeItem('accessToken')
        // Remove refreshToken from localStorage
        window.localStorage.removeItem('refreshToken')

        // Remove states
        setUser(null)
        setAccessToken(null)
        setRefreshToken(null)
        setIsLogged(false)
      }
    }
    initAuth()
    socket.on('accessToken', data => {
      if (data.action === 'CREATE') {
        const accessToken = data.data

        // Store accessToken in state
        setAccessToken(accessToken)
        // Set accessToken in localStorage
        window.localStorage.setItem('accessToken', accessToken)
      }
    })
  }, [])

  const handleLogin = async (params, errorCallback) => {
    try {
      const response = await post(authConfig.loginEndpoint, params)
      // Extract user, accessToken, refreshToken from the response body
      const { user, accessToken, refreshToken } = response.data
      // Store user in state
      setUser(user)
      // Store accessToken and refreshToken in state
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)

      // Set user data in localStorage
      window.localStorage.setItem('user', JSON.stringify(user))
      // Set accessToken in localStorage
      window.localStorage.setItem('accessToken', accessToken)
      // Set refreshToken in localStorage
      window.localStorage.setItem('refreshToken', refreshToken)

      setIsLogged(true)

      const returnUrl = router.query.returnUrl
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
    } catch (err) {
      if (errorCallback) errorCallback(err)
      else null
    }
  }

  const handleLogout = () => {
    // Remove states
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setIsLogged(false)

    // Remove user data from localStorage
    window.localStorage.removeItem('user')
    // Remove accessToken from localStorage
    window.localStorage.removeItem('accessToken')
    // Remove refreshToken from localStorage
    window.localStorage.removeItem('refreshToken')

    resetParamsFilteredMails()
    
    router.push('/login')
  }

  const handleRegister = async (params, errorCallback) => {
    console.log(params)
    try {
      const response = await post(authConfig.registerEndpoint, params)
      if (response.data.error) {
        if (errorCallback) errorCallback(response.data.error)
      } else {
        handleLogin({ email: params.email, password: params.password })
      }
    } catch (err) {
      if (errorCallback) errorCallback(err)
    }
  }

  const values = {
    user,
    accessToken,
    refreshToken,
    isLogged,
    loading,
    setLoading,
    setUser,
    register: handleRegister,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
