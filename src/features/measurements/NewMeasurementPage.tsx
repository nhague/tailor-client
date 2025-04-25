import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Grid,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Save as SaveIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useForm, Controller, FormProvider, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom'; // Use useNavigate from react-router-dom
import Layout from '../../components/layout/Layout'; // Update import path
import { useAuth } from '../../contexts/AuthContext'; // Update import path
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase'; // Update import path
import { Helmet } from 'react-helmet-async'; // Use react-helmet-async for head management



// Form validation schema
const measurementSchema = z.object({
  takenBy: z.enum(['self', 'tailor']),
  units: z.enum(['cm', 'inches']),
  height: z.number().positive('Must be greater than 0'),
  weight: z.number().positive('Must be greater than 0'),
  neck: z.number().positive('Must be greater than 0'),
  chest: z.number().positive('Must be greater than 0'),
  waist: z.number().positive('Must be greater than 0'),
  hips: z.number().positive('Must be greater than 0'),
  shoulder: z.number().positive('Must be greater than 0'),
  sleeveLength: z.number().positive('Must be greater than 0'),
  bicep: z.number().positive('Must be greater than 0'),
  wrist: z.number().positive('Must be greater than 0'),
  inseam: z.number().positive('Must be greater than 0'),
  outseam: z.number().positive('Must be greater than 0'),
  thigh: z.number().positive('Must be greater than 0'),
  knee: z.number().positive('Must be greater than 0'),
  calf: z.number().positive('Must be greater than 0'),
  ankle: z.number().positive('Must be greater than 0'),
  shirtLength: z.number().positive('Must be greater than 0'),
  jacketLength: z.number().positive('Must be greater than 0'),
  fitPreference: z.enum(['slim', 'regular', 'relaxed']),
  notes: z.string().optional(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

// Step 1: General Information
const GeneralInfoForm = () => {
  const { control, formState: { errors } } = useFormContext<MeasurementFormData>();
  const [openHelpDialog, setOpenHelpDialog] = useState(false);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        General Information
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Controller
            name="takenBy"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset">
                <FormLabel component="legend">Who is taking these measurements?</FormLabel>
                <RadioGroup row {...field}>
                  <FormControlLabel value="self" control={<Radio />} label="I'm taking them myself" />
                  <FormControlLabel value="tailor" control={<Radio />} label="Professional tailor" />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="units"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset">
                <FormLabel component="legend">Preferred units</FormLabel>
                <ToggleButtonGroup
                  exclusive
                  {...field}
                  onChange={(_, value) => value && field.onChange(value)}
                >
                  <ToggleButton value="cm">Centimeters (cm)</ToggleButton>
                  <ToggleButton value="inches">Inches (in)</ToggleButton>
                </ToggleButtonGroup>
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Height"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                }}
                error={!!errors.height}
                helperText={errors.height?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Weight"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                }}
                error={!!errors.weight}
                helperText={errors.weight?.message}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="fitPreference"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset">
                <FormLabel component="legend">Preferred Fit</FormLabel>
                <RadioGroup row {...field}>
                  <FormControlLabel value="slim" control={<Radio />} label="Slim Fit" />
                  <FormControlLabel value="regular" control={<Radio />} label="Regular Fit" />
                  <FormControlLabel value="relaxed" control={<Radio />} label="Relaxed Fit" />
                </RadioGroup>
              </FormControl>
            )}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<HelpIcon />}
          onClick={() => setOpenHelpDialog(true)}
        >
          Measurement Guide
        </Button>
      </Box>

      {/* Help Dialog */}
      <Dialog open={openHelpDialog} onClose={() => setOpenHelpDialog(false)} maxWidth="md">
        <DialogTitle>Measurement Guide</DialogTitle>
        <DialogContent>
          <DialogContentText>
            For accurate measurements, we recommend:
          </DialogContentText>
          <Box component="ul">
            <Box component="li">Use a soft measuring tape</Box>
            <Box component="li">Wear fitted clothes or underwear for accurate measurements</Box>
            <Box component="li">Stand naturally, don't flex muscles or hold breath</Box>
            <Box component="li">Have someone help you for more accuracy</Box>
            <Box component="li">Measure twice to confirm each measurement</Box>
          </Box>
          <DialogContentText sx={{ mt: 2 }}>
            For height, stand straight against a wall without shoes.
          </DialogContentText>
          <DialogContentText>
            For weight, use a scale in the morning for consistency.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHelpDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Step 2: Upper Body Measurements
const UpperBodyForm = () => {
  const { control, formState: { errors } } = useFormContext<MeasurementFormData>();
  const { watch } = useFormContext();
  const units = watch("units");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upper Body Measurements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="neck"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Neck"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.neck}
                helperText={errors.neck?.message || "Measure around the base of the neck"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="chest"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Chest"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.chest}
                helperText={errors.chest?.message || "Measure around the fullest part of the chest"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="waist"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Waist"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.waist}
                helperText={errors.waist?.message || "Measure around the natural waistline"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="hips"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Hips"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.hips}
                helperText={errors.hips?.message || "Measure around the fullest part of the hips"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="shoulder"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Shoulder Width"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.shoulder}
                helperText={errors.shoulder?.message || "Measure from shoulder point to shoulder point"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="sleeveLength"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Sleeve Length"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.sleeveLength}
                helperText={errors.sleeveLength?.message || "Measure from shoulder to wrist"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="bicep"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Bicep"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.bicep}
                helperText={errors.bicep?.message || "Measure around the fullest part of the bicep"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="wrist"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Wrist"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.wrist}
                helperText={errors.wrist?.message || "Measure around the wrist bone"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Step 3: Lower Body Measurements
const LowerBodyForm = () => {
  const { control, formState: { errors } } = useFormContext<MeasurementFormData>();
  const { watch } = useFormContext();
  const units = watch("units");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lower Body Measurements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="inseam"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Inseam"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.inseam}
                helperText={errors.inseam?.message || "Measure from crotch to ankle"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="outseam"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Outseam"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.outseam}
                helperText={errors.outseam?.message || "Measure from waist to ankle"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="thigh"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Thigh"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.thigh}
                helperText={errors.thigh?.message || "Measure around the fullest part of the thigh"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="knee"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Knee"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.knee}
                helperText={errors.knee?.message || "Measure around the knee"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="calf"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Calf"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.calf}
                helperText={errors.calf?.message || "Measure around the fullest part of the calf"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="ankle"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Ankle"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.ankle}
                helperText={errors.ankle?.message || "Measure around the ankle bone"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Step 4: Additional Measurements & Notes
const AdditionalForm = () => {
  const { control, formState: { errors } } = useFormContext<MeasurementFormData>();
  const { watch } = useFormContext();
  const units = watch("units");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Additional Measurements
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="shirtLength"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Shirt Length"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.shirtLength}
                helperText={errors.shirtLength?.message || "Measure from shoulder to desired shirt length"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="jacketLength"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="number"
                label="Jacket Length"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">{units}</InputAdornment>,
                }}
                error={!!errors.jacketLength}
                helperText={errors.jacketLength?.message || "Measure from shoulder to desired jacket length"}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2">Reference Photos</Typography>
            <Button
              component="label"
              startIcon={<PhotoCameraIcon />}
              sx={{ ml: 2 }}
            >
              Add Photo
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
              />
            </Button>
          </Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload photos of yourself or well-fitting garments to help us understand your fit preferences.
          </Alert>
          <Typography variant="caption" color="text.secondary">
            No photos added yet.
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Additional Notes"
                multiline
                rows={4}
                fullWidth
                placeholder="Any specific preferences or details about your body shape that would be helpful for the tailor?"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const NewMeasurementPage = () => {
  const { userProfile } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Use useNavigate
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const methods = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      takenBy: 'self',
      units: 'cm',
      height: 0,
      weight: 0,
      neck: 0,
      chest: 0,
      waist: 0,
      hips: 0,
      shoulder: 0,
      sleeveLength: 0,
      bicep: 0,
      wrist: 0,
      inseam: 0,
      outseam: 0,
      thigh: 0,
      knee: 0,
      calf: 0,
      ankle: 0,
      shirtLength: 0,
      jacketLength: 0,
      fitPreference: 'regular',
      notes: '',
    },
  });

  const steps = [
    'General Information',
    'Upper Body',
    'Lower Body',
    'Additional Details',
  ];

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <GeneralInfoForm />;
      case 1:
        return <UpperBodyForm />;
      case 2:
        return <LowerBodyForm />;
      case 3:
        return <AdditionalForm />;
      default:
        return 'Unknown step';
    }
  };

  const handleNext = async () => {
    const fields = methods.getValues();

    // If it's the last step, submit the form
    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const isValid = await methods.trigger();
      if (!isValid) {
        return;
      }

      setLoading(true);
      const data = methods.getValues();

      if (!userProfile) {
        throw new Error('User not logged in');
      }

      // Add the measurement to Firestore
      const measurementData = {
        ...data,
        userId: userProfile.uid,
        dateTaken: serverTimestamp(),
        referencePhotoUrls: [], // Would be populated with uploaded photos
      };

      const docRef = await addDoc(collection(db, 'measurements'), measurementData);

      // Redirect to the measurements list
      navigate('/measurements'); // Use navigate
    } catch (error) {
      console.error('Error adding measurement:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout toggleTheme={toggleTheme}>
      <Helmet>
        <title>Add New Measurements | Bespoke Tailor</title>
      </Helmet>

      <Box sx={{ pb: 6 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Add New Measurements
        </Typography>

        <Typography variant="bodyLarge" color="text.secondary" sx={{ mb: 4 }}>
          Please provide your measurements below. For the best fit, we recommend having a professional tailor take your measurements.
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel={!isMobile}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{!isMobile && label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <FormProvider {...methods}>
              {getStepContent(activeStep)}
            </FormProvider>
          </CardContent>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              startIcon={<NavigateBeforeIcon />}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? <SaveIcon /> : <NavigateNextIcon />}
              disabled={loading}
            >
              {activeStep === steps.length - 1 ? 'Save Measurements' : 'Next'}
            </Button>
          </Box>
        </Card>
      </Box>
    </Layout>
  );
};

export default NewMeasurementPage;