import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/constants/Colors';
import { Category } from '@/types/database';
import { ArrowLeft, ChevronDown, Upload, Camera } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { StepIndicator } from '@/components/StepIndicator';
import { capturePhoto, pickImageFromLibrary } from '@/lib/imageHelpers';
import { validateDNI, validateIdentityImages, DNI_CAPTURE_TIPS } from '@/lib/identityValidation';
import { submitIdentityVerification } from '@/lib/identityService';

export default function CreateTechnicianProfileScreen() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [dniNumber, setDniNumber] = useState('');
  const [dniFrontImage, setDniFrontImage] = useState<string | null>(null);
  const [dniBackImage, setDniBackImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (!error && data) setCategories(data);
  };

  // Utilidades para imágenes
  const pickImage = async (setter: (uri: string) => void) => {
    try {
      const uri = await pickImageFromLibrary();
      if (uri) setter(uri);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async (setter: (uri: string) => void) => {
    try {
      const uri = await capturePhoto();
      if (uri) setter(uri);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo tomar la foto');
    }
  };

  const nextFromStep1 = () => {
    const errs: Record<string, string> = {};
    const dniValidation = validateDNI(dniNumber);
    if (!dniValidation.valid) {
      errs.dniNumber = dniValidation.error || 'DNI inválido';
    }
    if (!dniFrontImage) errs.dniFront = 'Falta frente';
    if (!dniBackImage) errs.dniBack = 'Falta dorso';
    setErrors(errs);
    if (!Object.keys(errs).length) setStep(2);
  };

  const nextFromStep2 = () => {
    const errs: Record<string, string> = {};
    if (!selfieImage) errs.selfie = 'Falta selfie';
    setErrors(errs);
    if (!Object.keys(errs).length) setStep(3);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!selectedCategory) newErrors.category = 'Selecciona una categoría';
    if (!description.trim()) newErrors.description = 'Ingresa una descripción';
    if (!location.trim()) newErrors.location = 'Ingresa una ubicación';
    
    const dniValidation = validateDNI(dniNumber);
    if (!dniValidation.valid) {
      newErrors.dniNumber = dniValidation.error || 'DNI inválido';
    }
    
    const imageValidation = validateIdentityImages({
      dniFront: dniFrontImage,
      dniBack: dniBackImage,
      selfie: selfieImage,
    });
    if (!imageValidation.valid) {
      if (imageValidation.errors?.dniFront) newErrors.dniFront = imageValidation.errors.dniFront;
      if (imageValidation.errors?.dniBack) newErrors.dniBack = imageValidation.errors.dniBack;
      if (imageValidation.errors?.selfie) newErrors.selfie = imageValidation.errors.selfie;
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length) {
      Alert.alert('Revisa los datos', 'Faltan campos obligatorios');
      return;
    }
    setLoading(true);
    setUploadProgress(0);
    
    try {
      // Primero crear el perfil de técnico
      const { error: profileError } = await supabase.from('technician_profiles').insert({
        id: user!.id,
        category_id: selectedCategory,
        description: description.trim(),
        location: location.trim(),
        price_range: priceRange.trim() || null,
        whatsapp: whatsapp.trim() || null,
        instagram: instagram.trim() || null,
        facebook: facebook.trim() || null,
      });
      if (profileError) throw profileError;

      // Luego subir las imágenes y crear la verificación
      const result = await submitIdentityVerification(
        {
          userId: user!.id,
          dniNumber: dniNumber.trim(),
          dniFrontUri: dniFrontImage!,
          dniBackUri: dniBackImage!,
          selfieUri: selfieImage!,
        },
        (progress: { step: string; progress: number }) => setUploadProgress(progress.progress)
      );

      if (!result.success) {
        throw new Error(result.error || 'Error al subir la verificación');
      }

      Alert.alert(
        'Solicitud enviada',
        'Estamos verificando tu identidad. Te avisaremos al completar el proceso.',
        [{ text: 'OK', onPress: () => router.replace('/technician/my-profile') }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo enviar la verificación');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const selectedCategoryName =
    categories.find((c) => c.id === selectedCategory)?.name || 'Seleccionar categoría';

  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paso 1: DNI (Frente y Dorso)</Text>
          
          {/* Tips de captura */}
          <TouchableOpacity 
            style={styles.tipsToggle} 
            onPress={() => setShowTips(!showTips)}
          >
            <Text style={styles.tipsToggleText}>
              {showTips ? '▼' : '▶'} Consejos para capturar
            </Text>
          </TouchableOpacity>
          
          {showTips && (
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>DNI Frente:</Text>
              {DNI_CAPTURE_TIPS.front.map((tip, i) => (
                <Text key={i} style={styles.tipText}>• {tip}</Text>
              ))}
              <Text style={[styles.tipsTitle, { marginTop: 8 }]}>DNI Dorso:</Text>
              {DNI_CAPTURE_TIPS.back.map((tip, i) => (
                <Text key={i} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}
          
          <Input
            label="Número de DNI *"
            placeholder="Ej: 12345678"
            value={dniNumber}
            onChangeText={setDniNumber}
            keyboardType="numeric"
            error={errors.dniNumber}
          />
          <View style={styles.imagesRow}>
            <View style={styles.imageBlock}>
              <Text style={styles.imageBlockLabel}>Frente *</Text>
              {dniFrontImage ? (
                <Image source={{ uri: dniFrontImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.emptyImage} />
              )}
              {errors.dniFront && <Text style={styles.errorText}>{errors.dniFront}</Text>}
              <View style={styles.inlineButtons}>
                <TouchableOpacity style={styles.smallBtn} onPress={() => takePhoto(setDniFrontImage)}>
                  <Camera size={18} color={Colors.primary} />
                  <Text style={styles.smallBtnText}>Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(setDniFrontImage)}>
                  <Upload size={18} color={Colors.primary} />
                  <Text style={styles.smallBtnText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.imageBlock}>
              <Text style={styles.imageBlockLabel}>Dorso *</Text>
              {dniBackImage ? (
                <Image source={{ uri: dniBackImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.emptyImage} />
              )}
              {errors.dniBack && <Text style={styles.errorText}>{errors.dniBack}</Text>}
              <View style={styles.inlineButtons}>
                <TouchableOpacity style={styles.smallBtn} onPress={() => takePhoto(setDniBackImage)}>
                  <Camera size={18} color={Colors.primary} />
                  <Text style={styles.smallBtnText}>Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(setDniBackImage)}>
                  <Upload size={18} color={Colors.primary} />
                  <Text style={styles.smallBtnText}>Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Button title="Continuar" onPress={nextFromStep1} />
        </View>
      );
    }
    if (step === 2) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paso 2: Selfie</Text>
          
          {/* Tips para selfie */}
          <TouchableOpacity 
            style={styles.tipsToggle} 
            onPress={() => setShowTips(!showTips)}
          >
            <Text style={styles.tipsToggleText}>
              {showTips ? '▼' : '▶'} Consejos para la selfie
            </Text>
          </TouchableOpacity>
          
          {showTips && (
            <View style={styles.tipsContainer}>
              {DNI_CAPTURE_TIPS.selfie.map((tip, i) => (
                <Text key={i} style={styles.tipText}>• {tip}</Text>
              ))}
            </View>
          )}
          
          {selfieImage ? (
            <Image source={{ uri: selfieImage }} style={styles.selfiePreview} />
          ) : (
            <View style={styles.emptySelfie} />
          )}
          {errors.selfie && <Text style={styles.errorText}>{errors.selfie}</Text>}
          <View style={styles.inlineButtons}>
            <TouchableOpacity style={styles.bigBtn} onPress={() => takePhoto(setSelfieImage)}>
              <Camera size={22} color={Colors.primary} />
              <Text style={styles.bigBtnText}>Tomar Selfie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bigBtn} onPress={() => pickImage(setSelfieImage)}>
              <Upload size={22} color={Colors.primary} />
              <Text style={styles.bigBtnText}>Elegir Imagen</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.stepNavRow}>
            <Button title="Volver" variant="secondary" onPress={() => setStep(1)} />
            <Button title="Continuar" onPress={nextFromStep2} />
          </View>
        </View>
      );
    }
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paso 3: Datos Profesionales</Text>
        <Text style={styles.helperText}>Completa la información de tu perfil.</Text>
        <View style={styles.reviewImagesRow}>
          <Image source={{ uri: dniFrontImage! }} style={styles.reviewMini} />
          <Image source={{ uri: dniBackImage! }} style={styles.reviewMini} />
          <Image source={{ uri: selfieImage! }} style={styles.reviewMini} />
        </View>
        <Input
          label="Descripción *"
          placeholder="Describe tu experiencia"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />
        <Input
          label="Ubicación *"
          placeholder="Ej: Palermo, Buenos Aires"
          value={location}
          onChangeText={setLocation}
          error={errors.location}
        />
        <Input
          label="Rango de Precios"
          placeholder="Ej: Desde $5000"
          value={priceRange}
          onChangeText={setPriceRange}
        />
        <Input
          label="WhatsApp"
          placeholder="+54 11 1234-5678"
          value={whatsapp}
          onChangeText={setWhatsapp}
          keyboardType="phone-pad"
        />
        <Input
          label="Instagram"
          placeholder="@tu_usuario"
          value={instagram}
          onChangeText={setInstagram}
          autoCapitalize="none"
        />
        <Input
          label="Facebook"
          placeholder="tu.perfil"
          value={facebook}
          onChangeText={setFacebook}
          autoCapitalize="none"
        />
        <View style={styles.stepNavRow}>
          <Button title="Volver" variant="secondary" onPress={() => setStep(2)} />
          <Button title={loading ? 'Enviando...' : 'Enviar Verificación'} onPress={handleSubmit} loading={loading} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Perfil Profesional</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Indicador de pasos */}
        <StepIndicator 
          currentStep={step} 
          totalSteps={3} 
          stepLabels={['DNI', 'Selfie', 'Perfil']}
        />
        
        {/* Indicador de progreso durante carga */}
        {loading && uploadProgress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress < 0.9 
                ? `Subiendo imágenes... ${Math.round(uploadProgress * 100)}%`
                : 'Finalizando...'}
            </Text>
          </View>
        )}
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <Text style={styles.helperText}>Selecciona el servicio que ofreces</Text>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          <TouchableOpacity
            style={[styles.pickerButton, errors.category && styles.pickerButtonError]}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.pickerButtonText, !selectedCategory && styles.pickerButtonTextPlaceholder]}>
              {selectedCategoryName}
            </Text>
            <ChevronDown size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        {renderStep()}
      </ScrollView>
      <Modal visible={showCategoryPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text style={styles.modalClose}>Cerrar</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.categoryList}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.categoryItem, selectedCategory === cat.id && styles.categoryItemActive]}
                  onPress={() => {
                    setSelectedCategory(cat.id);
                    setErrors({ ...errors, category: '' });
                    setShowCategoryPicker(false);
                  }}
                >
                  <View style={styles.categoryIconWrapper}>
                    <Text style={styles.categoryIcon}>{cat.icon || '🔧'}</Text>
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryItemName}>{cat.name}</Text>
                    {cat.description && (
                      <Text style={styles.categoryItemDescription}>{cat.description}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundGray },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  backButton: { padding: 4 },
  scroll: { flex: 1 },
  content: { padding: 16 },
  section: { backgroundColor: Colors.white, padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 },
  helperText: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  pickerButtonError: { borderColor: Colors.error },
  pickerButtonText: { fontSize: 16, color: Colors.text },
  pickerButtonTextPlaceholder: { color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  modalClose: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  categoryList: { padding: 16 },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: Colors.backgroundGray,
    gap: 12,
  },
  categoryItemActive: { backgroundColor: Colors.primary + '20', borderWidth: 2, borderColor: Colors.primary },
  categoryIconWrapper: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { fontSize: 24 },
  categoryInfo: { flex: 1 },
  categoryItemName: { fontSize: 16, fontWeight: '600', color: Colors.text },
  categoryItemDescription: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  imagesRow: { flexDirection: 'row', gap: 12 },
  imageBlock: { flex: 1 },
  imageBlockLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: Colors.text },
  emptyImage: { width: '100%', height: 140, backgroundColor: Colors.backgroundGray, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  previewImage: { width: '100%', height: 140, borderRadius: 8, marginBottom: 8 },
  inlineButtons: { flexDirection: 'row', gap: 8 },
  smallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  smallBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  selfiePreview: { width: '100%', height: 220, borderRadius: 12, marginBottom: 12 },
  emptySelfie: { width: '100%', height: 220, backgroundColor: Colors.backgroundGray, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, marginBottom: 12 },
  bigBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  bigBtnText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  stepNavRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  reviewImagesRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  reviewMini: { width: 70, height: 70, borderRadius: 8 },
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { fontSize: 12, color: Colors.error, marginBottom: 6 },
  tipsToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 8,
    marginBottom: 12,
  },
  tipsToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  tipsContainer: {
    backgroundColor: Colors.backgroundGray,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  progressContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
